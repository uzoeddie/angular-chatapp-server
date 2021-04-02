/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import redis, { RedisClient } from 'redis-mock';
import { Server } from 'socket.io';
import { authUserPayload } from '@root/mocks/auth.mock';
import { newPost, postMockRequest, postMockResponse } from '@mock/post.mock';
import { socketIOPostObject } from '@sockets/posts';
import { postQueue } from '@queues/post.queue';
import { Create } from '@posts/controllers/create-post';
import * as cloudinaryUploads from '@global/cloudinary-upload';
import { CustomError } from '@global/error-handler';

jest.useFakeTimers();
jest.mock('@sockets/posts');
jest.mock('@queues/post.queue');
jest.mock('@global/cloudinary-upload');

(socketIOPostObject as Server) = new Server();

describe('Create', () => {
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

  describe('post', () => {
    it('should send correct json response', async () => {
      const req: Request = postMockRequest(newPost, authUserPayload) as Request;
      const res: Response = postMockResponse();
      jest.spyOn(socketIOPostObject, 'emit');
      jest.spyOn(postQueue, 'addPostJob');

      await Create.prototype.post(req, res);
      expect(socketIOPostObject.emit).toHaveBeenCalled();
      expect(postQueue.addPostJob).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post created successfully',
        notification: true
      });
    });
  });

  describe('postWithImage', () => {
    it('should throw an error if image is not available', () => {
      newPost.image = undefined;
      const req: Request = postMockRequest(newPost, authUserPayload) as Request;
      const res: Response = postMockResponse();
      Create.prototype.postWithImage(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('"image" is required');
      });
    });

    it('should send correct json response', async () => {
      newPost.image = 'testing image';
      const req: Request = postMockRequest(newPost, authUserPayload) as Request;
      const res: Response = postMockResponse();
      jest.spyOn(socketIOPostObject, 'emit');
      jest.spyOn(postQueue, 'addPostJob');
      jest.spyOn(cloudinaryUploads, 'uploads').mockImplementation((): any => Promise.resolve({ version: '1234', public_id: '123456' }));

      await Create.prototype.postWithImage(req, res);
      expect(socketIOPostObject.emit).toHaveBeenCalled();
      expect(postQueue.addPostJob).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post added with image successfully'
      });
    });
  });
});
