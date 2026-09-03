import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';

export interface UploadResult {
  key: string;
  url: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.get<string>('R2_BUCKET_NAME') ?? '';
    this.publicUrl = this.config.get<string>('R2_PUBLIC_URL') ?? '';

    const endpoint = this.config.get<string>('R2_ENDPOINT');
    const accessKeyId = this.config.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.config.get<string>('R2_SECRET_ACCESS_KEY');

    if (!this.bucket || !this.publicUrl || !endpoint || !accessKeyId || !secretAccessKey) {
      throw new Error(
        'Missing object storage configuration. Check R2_ENDPOINT, R2_ACCESS_KEY_ID, ' +
          'R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME and R2_PUBLIC_URL in your .env file.',
      );
    }

    this.client = new S3Client({
      region: this.config.get<string>('R2_REGION') ?? 'auto',
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    extension: string,
  ): Promise<UploadResult> {
    const key = `objects/${uuid()}.${extension}`;

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
    } catch (error) {
      this.logger.error('Failed to upload image to R2', error as Error);
      throw new InternalServerErrorException('Unable to upload image');
    }

    return { key, url: `${this.publicUrl}/${key}` };
  }

  async deleteImage(key: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
      );
    } catch (error) {
      // Do not block object deletion if the image is already gone from R2
      this.logger.warn(`Failed to delete image ${key} from R2`, error as Error);
    }
  }
}
