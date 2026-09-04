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
import { UpdateObjectDto } from './dto/update-object.dto.js';
import { ObjectResponseDto } from './dto/object-response.dto.js';
import { StorageService } from '../storage/storage.service.js';
import { ObjectsGateway } from './objects.gateway.js';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

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

    const { key, url } = await this.storageService.uploadImage(file);

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

  async update(
    id: string,
    dto: UpdateObjectDto,
    file?: Express.Multer.File,
  ): Promise<ObjectResponseDto> {
    this.assertValidId(id);

    const object = await this.objectModel.findById(id).exec();
    if (!object) {
      throw new NotFoundException('Object not found');
    }

    if (dto.title !== undefined) {
      object.title = dto.title;
    }
    if (dto.description !== undefined) {
      object.description = dto.description;
    }

    if (file) {
      const detected = await fileTypeFromBuffer(file.buffer);
      const realMime = detected?.mime;

      if (!realMime || !ALLOWED_MIME_TYPES.includes(realMime)) {
        throw new BadRequestException(
          'Invalid image type. Allowed types: JPEG, PNG, WEBP',
        );
      }

      // Upload the replacement first — only delete the old image once the new one is confirmed,
      // so a failed upload never leaves the object without any image.
      const previousImageKey = object.imageKey;
      const { key, url } = await this.storageService.uploadImage(file);
      object.imageUrl = url;
      object.imageKey = key;
      await this.storageService.deleteImage(previousImageKey);
    }

    await object.save();

    const response = this.toResponseDto(object);
    this.gateway.emitUpdated(response);
    return response;
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
      updatedAt: object.updatedAt,
    };
  }
}
