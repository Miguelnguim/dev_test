import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ObjectsService } from './objects.service.js';

function buildService(overrides: Partial<Record<string, unknown>> = {}) {
  const objectModel = {
    create: vi.fn(),
    find: vi.fn(),
    findById: vi.fn(),
    deleteOne: vi.fn(),
    ...overrides,
  };
  const storageService = {
    uploadImage: vi.fn(),
    deleteImage: vi.fn(),
  };
  const gateway = {
    emitCreated: vi.fn(),
    emitUpdated: vi.fn(),
    emitDeleted: vi.fn(),
  };

  const service = new ObjectsService(
    objectModel as never,
    storageService as never,
    gateway as never,
  );

  return { service, objectModel, storageService, gateway };
}

describe('ObjectsService', () => {
  it('rejects creation when no image file is provided', async () => {
    const { service } = buildService();

    await expect(
      service.create({ title: 'Chair', description: 'Wooden chair' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects findOne with an invalid id', async () => {
    const { service } = buildService();

    await expect(service.findOne('not-an-id')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('throws NotFoundException when the object does not exist', async () => {
    const validId = new Types.ObjectId().toString();
    const { service, objectModel } = buildService({
      findById: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      }),
    });

    await expect(service.findOne(validId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(objectModel.findById).toHaveBeenCalledWith(validId);
  });

  it('rejects update with an invalid id', async () => {
    const { service } = buildService();

    await expect(
      service.update('not-an-id', { title: 'New title' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws NotFoundException when updating an object that does not exist', async () => {
    const validId = new Types.ObjectId().toString();
    const { service } = buildService({
      findById: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue(null) }),
    });

    await expect(
      service.update(validId, { title: 'New title' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates title/description without touching the image when no file is provided', async () => {
    const validId = new Types.ObjectId().toString();
    const found = {
      _id: validId,
      title: 'Old title',
      description: 'Old description',
      imageUrl: 'https://example.com/old.jpg',
      imageKey: 'objects/old.jpg',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
      save: vi.fn().mockResolvedValue(undefined),
    };
    const { service, storageService, gateway } = buildService({
      findById: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue(found) }),
    });

    const result = await service.update(validId, { title: 'New title' });

    expect(found.title).toBe('New title');
    expect(found.description).toBe('Old description');
    expect(found.save).toHaveBeenCalled();
    expect(storageService.uploadImage).not.toHaveBeenCalled();
    expect(storageService.deleteImage).not.toHaveBeenCalled();
    expect(gateway.emitUpdated).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'New title' }),
    );
    expect(result.title).toBe('New title');
  });

  it('replaces the image and deletes the old one only after a successful upload', async () => {
    const validId = new Types.ObjectId().toString();
    const found = {
      _id: validId,
      title: 'Chair',
      description: 'Wooden chair',
      imageUrl: 'https://example.com/old.jpg',
      imageKey: 'objects/old.jpg',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
      save: vi.fn().mockResolvedValue(undefined),
    };
    const { service, storageService } = buildService({
      findById: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue(found) }),
    });
    storageService.uploadImage.mockResolvedValue({
      key: 'objects/new.jpg',
      url: 'https://example.com/new.jpg',
    });

    const jpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
    const file = { buffer: jpegHeader } as Express.Multer.File;

    await service.update(validId, {}, file);

    expect(storageService.uploadImage).toHaveBeenCalledWith(file);
    expect(storageService.deleteImage).toHaveBeenCalledWith('objects/old.jpg');
    expect(found.imageKey).toBe('objects/new.jpg');
    expect(found.imageUrl).toBe('https://example.com/new.jpg');
  });

  it('deletes the image and the document, then emits object.deleted', async () => {
    const validId = new Types.ObjectId().toString();
    const found = { _id: validId, imageKey: 'objects/abc.jpg' };
    const { service, objectModel, storageService, gateway } = buildService({
      findById: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue(found),
      }),
      deleteOne: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue({}) }),
    });

    await service.remove(validId);

    expect(storageService.deleteImage).toHaveBeenCalledWith('objects/abc.jpg');
    expect(objectModel.deleteOne).toHaveBeenCalledWith({ _id: validId });
    expect(gateway.emitDeleted).toHaveBeenCalledWith(validId);
  });

  it('does not block deletion when R2 image removal fails', async () => {
    const validId = new Types.ObjectId().toString();
    const found = { _id: validId, imageKey: 'objects/missing.jpg' };
    const { service, objectModel, storageService } = buildService({
      findById: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue(found),
      }),
      deleteOne: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue({}) }),
    });
    storageService.deleteImage.mockResolvedValue(undefined); // service itself never throws

    await expect(service.remove(validId)).resolves.toBeUndefined();
    expect(objectModel.deleteOne).toHaveBeenCalled();
  });
});
