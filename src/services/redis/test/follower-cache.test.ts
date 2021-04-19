import { followerData } from '@mock/followers.mock';
import { followerCache } from '@redis/follower-cache';
import redis, { RedisClient } from 'redis-mock';

jest.useFakeTimers();

describe('FollowerCache', () => {
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

  describe('saveFollowerToRedisCache', () => {
    it('should add follower', async () => {
      await expect(followerCache.saveFollowerToRedisCache('followers:605727cd646cb50e668a4e13', followerData)).resolves.toBeUndefined();
    });
  });

  describe('removeFollowerFromRedisCache', () => {
    it('should remove follower', async () => {
      await followerCache.saveFollowerToRedisCache('followers:605727cd646cb50e668a4e13', followerData);
      await expect(
        followerCache.removeFollowerFromRedisCache('followers:605727cd646cb50e668a4e13', '605727cd646cb50e668a4e13')
      ).resolves.toBeUndefined();
    });
  });

  describe('getFollowersFromRedisCache', () => {
    it('should get followers', async () => {
      await followerCache.saveFollowerToRedisCache('followers:605727cd646cb50e668a4e13', followerData);
      await expect(followerCache.getFollowersFromRedisCache('followers:605727cd646cb50e668a4e13')).resolves.toStrictEqual([followerData]);
    });
  });
});
