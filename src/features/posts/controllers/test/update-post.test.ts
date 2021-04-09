/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import redis, { RedisClient } from 'redis-mock';
import { Server } from 'socket.io';
import { authUserPayload } from '@root/mocks/auth.mock';
import { newPost, postMockData, postMockRequest, postMockResponse } from '@mock/post.mock';
import * as cache from '@redis/post-cache';
import { Update } from '@posts/controllers/update-post';
import { postQueue } from '@queues/post.queue';
import { socketIOPostObject } from '@sockets/posts';
import * as cloudinaryUploads from '@global/cloudinary-upload';

jest.useFakeTimers();
jest.mock('@sockets/posts');
jest.mock('@redis/post-cache');
jest.mock('@queues/post.queue');
jest.mock('@global/cloudinary-upload');

(socketIOPostObject as Server) = new Server();

describe('Update', () => {
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

  describe('posts', () => {
    it('should send correct json response', async () => {
      const req: Request = postMockRequest(newPost, authUserPayload, { postId: '12345' }) as Request;
      const res: Response = postMockResponse();
      jest.spyOn(cache, 'updatePostInRedisCache').mockImplementation((): any => postMockData);
      jest.spyOn(socketIOPostObject, 'emit');
      jest.spyOn(postQueue, 'addPostJob');

      await Update.prototype.post(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post updated successfully',
        notification: true
      });
    });
  });

  describe('postWithImage', () => {
    it('should send correct json response if imgId and imgVersion exists', async () => {
      newPost.imgId = '1234';
      newPost.imgVersion = '1234';
      const req: Request = postMockRequest(newPost, authUserPayload, { postId: '12345' }) as Request;
      const res: Response = postMockResponse();
      jest.spyOn(cache, 'updatePostInRedisCache').mockImplementation((): any => postMockData);
      jest.spyOn(socketIOPostObject, 'emit');
      jest.spyOn(postQueue, 'addPostJob');

      await Update.prototype.postWithImage(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post updated successfully',
        notification: true
      });
    });

    it('should send correct json response if no imgId and imgVersion', async () => {
      newPost.imgId = undefined;
      newPost.imgVersion = undefined;
      const req: Request = postMockRequest(newPost, authUserPayload, { postId: '12345' }) as Request;
      const res: Response = postMockResponse();
      jest.spyOn(cache, 'updatePostInRedisCache').mockImplementation((): any => postMockData);
      jest.spyOn(cloudinaryUploads, 'uploads').mockImplementation((): any => Promise.resolve({ version: '1234', public_id: '123456' }));
      jest.spyOn(socketIOPostObject, 'emit');
      jest.spyOn(postQueue, 'addPostJob');

      await Update.prototype.postWithImage(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post updated successfully',
        notification: true
      });
    });
  });
});
