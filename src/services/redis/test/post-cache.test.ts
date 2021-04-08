import redis, { RedisClient } from 'redis-mock';
import {
  deletePostFromCache,
  getPostsFromCache,
  getSinglePostFromCache,
  getUserPostsFromCache,
  savePostsToRedisCache,
  updatePostInRedisCache,
  updateSinglePostPropInRedisCache
} from '@redis/post-cache';
import { postMockData, updatedPost } from '@mock/post.mock';
import MockDate from 'mockdate';

jest.useFakeTimers();

describe('PostCache', () => {
  let client: RedisClient;
  beforeEach(() => {
    jest.restoreAllMocks();
    MockDate.set('2021-04-04');
    client = redis.createClient();
  });

  afterEach((done) => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    client.flushall(done);
    client.quit(done);
    MockDate.reset();
  });

  afterAll((done) => {
    done();
  });

  describe('savePostsToRedisCache', () => {
    it('should add post', async () => {
      await expect(savePostsToRedisCache('6027f77087c9d9ccb1555268', 123, postMockData)).resolves.toBeUndefined();
    });
  });

  describe('updatePostInRedisCache', () => {
    it('should update post', async () => {
      ((postMockData._id as unknown) as string) = '6027f77087c9d9ccb1555268';
      updatedPost.createdAt = new Date();
      postMockData.createdAt = new Date();
      postMockData.post = updatedPost.post;
      postMockData.reactions = [];
      await savePostsToRedisCache('6027f77087c9d9ccb1555268', 123, postMockData);
      await expect(updatePostInRedisCache('6027f77087c9d9ccb1555268', updatedPost)).resolves.toStrictEqual(postMockData);
    });
  });

  describe('updateSinglePostPropInRedisCache', () => {
    it('should update post reactions', async () => {
      await savePostsToRedisCache('6027f77087c9d9ccb1555268', 123, postMockData);
      await expect(
        updateSinglePostPropInRedisCache('6027f77087c9d9ccb1555268', 'reactions', JSON.stringify([{ type: 'love', value: 2 }]))
      ).resolves.toBeUndefined();
    });
  });

  describe('getPostsFromCache', () => {
    it('should get posts', async () => {
      postMockData.createdAt = new Date();
      ((postMockData._id as unknown) as string) = '6027f77087c9d9ccb1555268';
      postMockData.reactions = [];
      await savePostsToRedisCache('6027f77087c9d9ccb1555268', 123, postMockData);
      await expect(getPostsFromCache('post', 0, 1)).resolves.toStrictEqual([postMockData]);
    });
  });

  describe('getSinglePostFromCache', () => {
    it('should get single post', async () => {
      postMockData.createdAt = new Date();
      ((postMockData._id as unknown) as string) = '6027f77087c9d9ccb1555268';
      postMockData.reactions = [];
      await savePostsToRedisCache('6027f77087c9d9ccb1555268', 123, postMockData);
      await expect(getSinglePostFromCache('6027f77087c9d9ccb1555268')).resolves.toStrictEqual([postMockData]);
    });
  });

  describe('getUserPostsFromCache', () => {
    it('should user posts', async () => {
      postMockData.createdAt = new Date();
      ((postMockData._id as unknown) as string) = '6027f77087c9d9ccb1555268';
      postMockData.reactions = [];
      await savePostsToRedisCache('6027f77087c9d9ccb1555268', 123, postMockData);
      await expect(getUserPostsFromCache('post', 123)).resolves.toStrictEqual([postMockData]);
    });
  });

  describe('deletePostFromCache', () => {
    it('should delete post', async () => {
      await savePostsToRedisCache('6027f77087c9d9ccb1555268', 123, postMockData);
      await expect(deletePostFromCache('6027f77087c9d9ccb1555268')).resolves.toBeUndefined();
    });
  });
});
