import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ObjectDocument = HydratedDocument<ObjectEntity>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class ObjectEntity {
  @Prop({ required: true, trim: true, maxlength: 100 })
  title: string;

  @Prop({ required: true, trim: true, maxlength: 1000 })
  description: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: true })
  imageKey: string; // R2 object key, needed to delete the file later

  createdAt: Date;
}

export const ObjectSchema = SchemaFactory.createForClass(ObjectEntity);
