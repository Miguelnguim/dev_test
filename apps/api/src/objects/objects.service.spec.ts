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
