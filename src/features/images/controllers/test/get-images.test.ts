/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import redis, { RedisClient } from 'redis-mock';
import { authUserPayload } from '@root/mocks/auth.mock';
import { fileDocument, imagesMockRequest, imagesMockResponse } from '@mock/image.mock';
import { Get } from '@images/controllers/get-images';
import { ImageModel } from '@images/models/images.schema';
import mongoose from 'mongoose';

jest.useFakeTimers();

describe('Get', () => {
  let client: RedisClient;
  beforeEach(() => {
    jest.restoreAllMocks();
    client = redis.createClient();
  });

  afterEach((done) => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    client.flushall(done);
    client.quit(done);
  });

  afterAll((done) => {
    mongoose.connection.close();
    done();
  });

  it('should send correct json response', async () => {
    const req: Request = imagesMockRequest({}, {}, authUserPayload, { imageId: '12345' }) as Request;
    const res: Response = imagesMockResponse();
    jest.spyOn(ImageModel, 'findOne');
    jest.spyOn(mongoose.Query.prototype, 'exec').mockResolvedValueOnce(fileDocument);

    await Get.prototype.images(req, res);
    expect(ImageModel.findOne).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User images',
      images: fileDocument
    });
  });
});
