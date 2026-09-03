import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { fileTypeFromBuffer } from 'file-type';
import { ObjectEntity, ObjectDocument } from './schemas/object.schema.js';
import { CreateObjectDto } from './dto/create-object.dto.js';
import { ObjectResponseDto } from './dto/object-response.dto.js';
import { StorageService } from '../storage/storage.service.js';
import { ObjectsGateway } from './objects.gateway.js';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const EXTENSION_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

@Injectable()
export class ObjectsService {
  constructor(
    @InjectModel(ObjectEntity.name)
    private readonly objectModel: Model<ObjectDocument>,
    private readonly storageService: StorageService,
    private readonly gateway: ObjectsGateway,
  ) {}

  async create(
    dto: CreateObjectDto,
    file?: Express.Multer.File,
  ): Promise<ObjectResponseDto> {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    // Never trust the client-declared mimetype/extension alone: sniff the real file signature.
    const detected = await fileTypeFromBuffer(file.buffer);
    const realMime = detected?.mime;

    if (!realMime || !ALLOWED_MIME_TYPES.includes(realMime)) {
      throw new BadRequestException(
        'Invalid image type. Allowed types: JPEG, PNG, WEBP',
      );
    }

    const extension = EXTENSION_BY_MIME[realMime];
    const { key, url } = await this.storageService.uploadImage(file, extension);

    const created = await this.objectModel.create({
      title: dto.title,
      description: dto.description,
      imageUrl: url,
      imageKey: key,
    });

    const response = this.toResponseDto(created);
    this.gateway.emitCreated(response);
    return response;
  }

  async findAll(): Promise<ObjectResponseDto[]> {
    const objects = await this.objectModel
      .find()
      .select('title description imageUrl createdAt')
      .sort({ createdAt: -1 })
      .exec();

    return objects.map((object) => this.toResponseDto(object));
  }

  async findOne(id: string): Promise<ObjectResponseDto> {
    this.assertValidId(id);

    const object = await this.objectModel.findById(id).exec();
    if (!object) {
      throw new NotFoundException('Object not found');
    }

    return this.toResponseDto(object);
  }

  async remove(id: string): Promise<void> {
    this.assertValidId(id);

    const object = await this.objectModel.findById(id).exec();
    if (!object) {
      throw new NotFoundException('Object not found');
    }

    // Delete image first but never let an R2 failure block DB cleanup.
    await this.storageService.deleteImage(object.imageKey);
    await this.objectModel.deleteOne({ _id: id }).exec();

    this.gateway.emitDeleted(id);
  }

  private assertValidId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid object id');
    }
  }

  private toResponseDto(object: ObjectDocument): ObjectResponseDto {
    return {
      id: object._id.toString(),
      title: object.title,
      description: object.description,
      imageUrl: object.imageUrl,
      createdAt: object.createdAt,
    };
  }
}
