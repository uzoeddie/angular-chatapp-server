/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import redis, { RedisClient } from 'redis-mock';
import { authUserPayload } from '@root/mocks/auth.mock';
import { newPost, postMockData, postMockRequest, postMockResponse } from '@mock/post.mock';
import { Get } from '@posts/controllers/get-posts';
import { postCache } from '@redis/post-cache';
import { Helpers } from '@global/helpers';

jest.useFakeTimers();
jest.mock('@sockets/posts');
jest.mock('@redis/post-cache');

describe('Get', () => {
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
    it('should send correct json response if posts exist in cache', async () => {
      const req: Request = postMockRequest(newPost, authUserPayload, { page: '1' }) as Request;
      const res: Response = postMockResponse();
      jest.spyOn(postCache, 'getPostsFromCache').mockImplementation((): any => [postMockData]);

      await Get.prototype.posts(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All posts',
        posts: [postMockData],
        type: 'posts'
      });
    });

    it('should send correct json response if posts exist in database', async () => {
      const req: Request = postMockRequest(newPost, authUserPayload, { page: '1' }) as Request;
      const res: Response = postMockResponse();
      jest.spyOn(postCache, 'getPostsFromCache').mockImplementation((): any => []);
      jest.spyOn(Helpers, 'getUserPosts').mockImplementation((): any => Promise.resolve([postMockData]));

      await Get.prototype.posts(req, res);
      expect(Helpers.getUserPosts).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All posts',
        posts: [postMockData],
        type: 'posts'
      });
    });
  });

  describe('postById', () => {
    it('should send correct json response if posts exist in cache', async () => {
      const req: Request = postMockRequest(newPost, authUserPayload, { postId: '12345' }) as Request;
      const res: Response = postMockResponse();
      jest.spyOn(postCache, 'getSinglePostFromCache').mockImplementation((): any => [postMockData]);

      await Get.prototype.postById(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Single post',
        post: postMockData
      });
    });

    it('should send correct json response if posts exist in database', async () => {
      const req: Request = postMockRequest(newPost, authUserPayload, { postId: '12345' }) as Request;
      const res: Response = postMockResponse();
      jest.spyOn(postCache, 'getSinglePostFromCache').mockImplementation((): any => []);
      jest.spyOn(Helpers, 'getUserPosts').mockImplementation((): any => Promise.resolve([postMockData]));

      await Get.prototype.postById(req, res);
      expect(Helpers.getUserPosts).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Single post',
        post: postMockData
      });
    });
  });
});
