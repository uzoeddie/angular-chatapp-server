/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import redis, { RedisClient } from 'redis-mock';
import { Server } from 'socket.io';
import { CustomError } from '@global/error-handler';
import { authUserPayload } from '@root/mocks/auth.mock';
import { imagesMockRequest, imagesMockResponse } from '@mock/image.mock';
import { Add } from '@images/controllers/add-image';
import { socketIOImageObject } from '@sockets/images';
import { imageQueue } from '@queues/image.queue';
import { userInfoCache } from '@redis/user-info-cache';
import { existingUser } from '@mock/user.mock';
import * as cloudinaryUploads from '@global/cloudinary-upload';

jest.useFakeTimers();
jest.mock('@sockets/images');
jest.mock('@redis/user-info-cache');
jest.mock('@queues/image.queue');
jest.mock('@global/cloudinary-upload');

(socketIOImageObject as Server) = new Server();

describe('Add', () => {
  let client: RedisClient;
  beforeEach(() => {
    jest.restoreAllMocks();
    client = redis.createClient({ host: '127.0.0.1', port: 6379 });
  });

  afterEach((done) => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    client.flushall(done);
    client.quit(done);
  });

  afterAll((done) => {
    done();
  });

  describe('image', () => {
    it('should throw an error if image is not available', () => {
      const req: Request = imagesMockRequest({}, { image: '' }) as Request;
      const res: Response = imagesMockResponse();
      Add.prototype.image(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('"image" is not allowed to be empty');
      });
    });

    it('should send correct json response', async () => {
      const req: Request = imagesMockRequest({}, { image: 'testing' }, authUserPayload) as Request;
      const res: Response = imagesMockResponse();
      jest.spyOn(userInfoCache, 'updateSingleUserItemInRedisCache').mockImplementation((): any => Promise.resolve(existingUser));
      jest.spyOn(socketIOImageObject, 'emit');
      jest.spyOn(imageQueue, 'addImageJob');
      jest.spyOn(cloudinaryUploads, 'uploads').mockImplementation((): any => Promise.resolve({ version: '1234', public_id: '123456' }));

      await Add.prototype.image(req, res);
      expect(socketIOImageObject.emit).toHaveBeenCalled();
      expect(imageQueue.addImageJob).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Image added successfully',
        notification: true
      });
    });
  });

  describe('backgroundImage', () => {
    it('should throw an error if image is not available', () => {
      const req: Request = imagesMockRequest({}, { image: '' }) as Request;
      const res: Response = imagesMockResponse();
      Add.prototype.backgroundImage(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('"image" is not allowed to be empty');
      });
    });

    it('should send correct json response', async () => {
      const req: Request = imagesMockRequest({}, { image: 'testing' }, authUserPayload) as Request;
      const res: Response = imagesMockResponse();
      jest.spyOn(socketIOImageObject, 'emit');
      jest.spyOn(Promise, 'all').mockImplementation((): any => [existingUser, existingUser]);
      jest.spyOn(imageQueue, 'addImageJob');
      jest.spyOn(cloudinaryUploads, 'uploads').mockImplementation((): any => Promise.resolve({ version: '1234', public_id: '123456' }));

      await Add.prototype.backgroundImage(req, res);
      expect(socketIOImageObject.emit).toHaveBeenCalled();
      expect(imageQueue.addImageJob).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Image added successfully',
        notification: true
      });
    });
  });
});
