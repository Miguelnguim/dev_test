import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ObjectDocument = HydratedDocument<ObjectEntity>;

@Schema({ timestamps: { createdAt: true, updatedAt: true } })
export class ObjectEntity {
  @Prop({ required: true, trim: true, maxlength: 100 })
  title: string;

  @Prop({ required: true, trim: true, maxlength: 1000 })
  description: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: true })
  imageKey: string; // Cloudinary public_id, needed to delete/replace the asset later

  createdAt: Date;
  updatedAt: Date;
}

export const ObjectSchema = SchemaFactory.createForClass(ObjectEntity);
