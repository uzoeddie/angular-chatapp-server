import { followerData } from '@mock/followers.mock';
import { saveFollowerToRedisCache, removeFollowerFromRedisCache, getFollowersFromRedisCache } from '@redis/follower-cache';
import redis, { RedisClient } from 'redis-mock';

jest.useFakeTimers();

describe('FollowerCache', () => {
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

  describe('saveFollowerToRedisCache', () => {
    it('should add follower', async () => {
      await expect(saveFollowerToRedisCache('followers:605727cd646cb50e668a4e13', followerData)).resolves.toBeUndefined();
    });
  });

  describe('removeFollowerFromRedisCache', () => {
    it('should remove follower', async () => {
      await saveFollowerToRedisCache('followers:605727cd646cb50e668a4e13', followerData);
      await expect(removeFollowerFromRedisCache('followers:605727cd646cb50e668a4e13', '605727cd646cb50e668a4e13')).resolves.toBeUndefined();
    });
  });

  describe('getFollowersFromRedisCache', () => {
    it('should get followers', async () => {
      await saveFollowerToRedisCache('followers:605727cd646cb50e668a4e13', followerData);
      await expect(getFollowersFromRedisCache('followers:605727cd646cb50e668a4e13')).resolves.toStrictEqual([followerData]);
    });
  });
});
