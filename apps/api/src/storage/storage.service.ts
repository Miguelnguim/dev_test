import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { v4 as uuid } from 'uuid';

export interface UploadResult {
  key: string; // Cloudinary public_id, needed to delete the asset later
  url: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(private readonly config: ConfigService) {
    const cloudName = this.config.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.config.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.config.get<string>('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error(
        'Missing Cloudinary configuration. Check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY ' +
          'and CLOUDINARY_API_SECRET in your .env file.',
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<UploadResult> {
    const publicId = `objects/${uuid()}`;

    try {
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            public_id: publicId,
            resource_type: 'image',
            overwrite: false,
          },
          (error, uploadResult) => {
            if (error || !uploadResult) {
              return reject(error ?? new Error('Cloudinary upload failed'));
            }
            resolve(uploadResult);
          },
        );
        uploadStream.end(file.buffer);
      });

      return { key: result.public_id, url: result.secure_url };
    } catch (error) {
      this.logger.error('Failed to upload image to Cloudinary', error as Error);
      throw new InternalServerErrorException('Unable to upload image');
    }
  }

  async deleteImage(key: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(key);
    } catch (error) {
      // Do not block object deletion if the image is already gone from Cloudinary
      this.logger.warn(`Failed to delete image ${key} from Cloudinary`, error as Error);
    }
  }
}
