import redis, { RedisClient } from 'redis-mock';
import MockDate from 'mockdate';
import { postCache } from '@redis/post-cache';
import { postMockData, updatedPost } from '@mock/post.mock';
import { existingUser } from '@mock/user.mock';

jest.useFakeTimers();

describe('PostCache', () => {
  let client: RedisClient;
  beforeEach(() => {
    jest.restoreAllMocks();
    MockDate.set('2021-04-04');
    client = redis.createClient({ host: '127.0.0.1', port: 6379 });
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
      await expect(
        postCache.savePostsToRedisCache('6027f77087c9d9ccb1555268', `${existingUser._id}`, 123, postMockData)
      ).resolves.toBeUndefined();
    });
  });

  describe('updatePostInRedisCache', () => {
    it('should update post', async () => {
      ((postMockData._id as unknown) as string) = '6027f77087c9d9ccb1555268';
      updatedPost.createdAt = new Date();
      postMockData.createdAt = new Date();
      postMockData.post = updatedPost.post;
      postMockData.reactions = [];
      await postCache.savePostsToRedisCache('6027f77087c9d9ccb1555268', `${existingUser._id}`, 123, postMockData);
      await expect(postCache.updatePostInRedisCache('6027f77087c9d9ccb1555268', updatedPost)).resolves.toStrictEqual(postMockData);
    });
  });

  describe('updateSinglePostPropInRedisCache', () => {
    it('should update post reactions', async () => {
      await postCache.savePostsToRedisCache('6027f77087c9d9ccb1555268', `${existingUser._id}`, 123, postMockData);
      await expect(
        postCache.updateSinglePostPropInRedisCache('6027f77087c9d9ccb1555268', 'reactions', JSON.stringify([{ type: 'love', value: 2 }]))
      ).resolves.toBeUndefined();
    });
  });

  describe('getPostsFromCache', () => {
    it('should get posts', async () => {
      postMockData.createdAt = new Date();
      ((postMockData._id as unknown) as string) = '6027f77087c9d9ccb1555268';
      postMockData.reactions = [];
      await postCache.savePostsToRedisCache('6027f77087c9d9ccb1555268', `${existingUser._id}`, 123, postMockData);
      await expect(postCache.getPostsFromCache('post', 0, 1)).resolves.toStrictEqual([postMockData]);
    });
  });

  describe('getSinglePostFromCache', () => {
    it('should get single post', async () => {
      postMockData.createdAt = new Date();
      ((postMockData._id as unknown) as string) = '6027f77087c9d9ccb1555268';
      postMockData.reactions = [];
      await postCache.savePostsToRedisCache('6027f77087c9d9ccb1555268', `${existingUser._id}`, 123, postMockData);
      await expect(postCache.getSinglePostFromCache('6027f77087c9d9ccb1555268')).resolves.toStrictEqual([postMockData]);
    });
  });

  describe('getUserPostsFromCache', () => {
    it('should user posts', async () => {
      postMockData.createdAt = new Date();
      ((postMockData._id as unknown) as string) = '6027f77087c9d9ccb1555268';
      postMockData.reactions = [];
      await postCache.savePostsToRedisCache('6027f77087c9d9ccb1555268', `${existingUser._id}`, 123, postMockData);
      await expect(postCache.getUserPostsFromCache('post', 123)).resolves.toStrictEqual([postMockData]);
    });
  });

  describe('deletePostFromCache', () => {
    it('should delete post', async () => {
      await postCache.savePostsToRedisCache('6027f77087c9d9ccb1555268', `${existingUser._id}`, 123, postMockData);
      await expect(postCache.deletePostFromCache('6027f77087c9d9ccb1555268', `${existingUser._id}`)).resolves.toBeUndefined();
    });
  });
});
