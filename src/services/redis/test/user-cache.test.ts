/* eslint-disable @typescript-eslint/no-explicit-any */
import redis, { RedisClient } from 'redis-mock';
import MockDate from 'mockdate';
import { userCache } from '@redis/user-cache';
import { existingUser } from '@mock/user.mock';

jest.useFakeTimers();

describe('UserCache', () => {
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

  describe('saveUserToRedisCache', () => {
    it('should add user', async () => {
      await expect(userCache.saveUserToRedisCache('60263f14648fed5246e322d9', '123', existingUser as any)).resolves.toBeUndefined();
    });
  });

  describe('getUserFromCache', () => {
    it('should get user', async () => {
      delete existingUser.password;
      delete existingUser.passwordResetExpires;
      delete existingUser.passwordResetToken;
      existingUser.createdAt = new Date();
      await userCache.saveUserToRedisCache('60263f14648fed5246e322d9', '123', existingUser as any);
      await expect(userCache.getUserFromCache('60263f14648fed5246e322d9')).resolves.toStrictEqual(existingUser);
    });
  });

  describe('getUsersFromCache', () => {
    it('should get users', async () => {
      delete existingUser.password;
      delete existingUser.passwordResetExpires;
      delete existingUser.passwordResetToken;
      existingUser.createdAt = new Date();
      await userCache.saveUserToRedisCache('60263f14648fed5246e322d9', '123', existingUser as any);
      await userCache.saveUserToRedisCache('60263f14648fed5246e322d0', '123', existingUser as any);
      await expect(userCache.getUsersFromCache(0, 1, '60263f14648fed5246e322d9')).resolves.toStrictEqual([existingUser]);
    });
  });

  describe('updateUserFollowersInRedisCache', () => {
    it('should update follower', async () => {
      await userCache.saveUserToRedisCache('60263f14648fed5246e322d9', '123', existingUser as any);
      await expect(userCache.updateUserFollowersInRedisCache('60263f14648fed5246e322d9', 'followersCount', 1)).resolves.toBeUndefined();
    });
  });

  describe('updateBlockedUserPropInRedisCache', () => {
    it('should update user blockedBy list', async () => {
      await userCache.saveUserToRedisCache('60263f14648fed5246e322d9', '123', existingUser as any);
      await userCache.saveUserToRedisCache('60263f14648fed5246e322d0', '123', existingUser as any);
      await expect(
        userCache.updateBlockedUserPropInRedisCache('60263f14648fed5246e322d9', 'blockedBy', '60263f14648fed5246e322d0', 'block')
      ).resolves.toBeUndefined();
    });

    it('should update user blocked list', async () => {
      await userCache.saveUserToRedisCache('60263f14648fed5246e322d9', '123', existingUser as any);
      await userCache.saveUserToRedisCache('60263f14648fed5246e322d0', '123', existingUser as any);
      await expect(
        userCache.updateBlockedUserPropInRedisCache('60263f14648fed5246e322d0', 'blocked', '60263f14648fed5246e322d9', 'block')
      ).resolves.toBeUndefined();
    });
  });

  describe('updateNotificationSettingInCache', () => {
    it('should update follower', async () => {
      const settings = {
        messages: true,
        reactions: false,
        comments: true,
        follows: false
      };
      await userCache.saveUserToRedisCache('60263f14648fed5246e322d9', '123', existingUser as any);
      await expect(
        userCache.updateNotificationSettingInCache('60263f14648fed5246e322d9', 'notifications', settings)
      ).resolves.toBeUndefined();
    });
  });
});
