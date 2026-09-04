import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ObjectsService } from './objects.service.js';
import { CreateObjectDto } from './dto/create-object.dto.js';
import { UpdateObjectDto } from './dto/update-object.dto.js';
import { ObjectResponseDto } from './dto/object-response.dto.js';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

@Controller('objects')
export class ObjectsController {
  constructor(private readonly objectsService: ObjectsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: MAX_FILE_SIZE_BYTES },
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateObjectDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ObjectResponseDto> {
    return this.objectsService.create(dto, file);
  }

  @Get()
  findAll(): Promise<ObjectResponseDto[]> {
    return this.objectsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ObjectResponseDto> {
    return this.objectsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: MAX_FILE_SIZE_BYTES },
    }),
  )
  update(
    @Param('id') id: string,
    @Body() dto: UpdateObjectDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ObjectResponseDto> {
    return this.objectsService.update(id, dto, file);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.objectsService.remove(id);
  }
}
