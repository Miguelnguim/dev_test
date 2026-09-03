import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ObjectsController } from './objects.controller.js';
import { ObjectsService } from './objects.service.js';
import { ObjectsGateway } from './objects.gateway.js';
import { ObjectEntity, ObjectSchema } from './schemas/object.schema.js';
import { StorageModule } from '../storage/storage.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ObjectEntity.name, schema: ObjectSchema },
    ]),
    StorageModule,
  ],
  controllers: [ObjectsController],
  providers: [ObjectsService, ObjectsGateway],
})
export class ObjectsModule {}
