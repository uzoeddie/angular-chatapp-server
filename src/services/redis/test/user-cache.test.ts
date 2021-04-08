/* eslint-disable @typescript-eslint/no-explicit-any */
import redis, { RedisClient } from 'redis-mock';
import MockDate from 'mockdate';
import {
  saveUserToRedisCache,
  getUserFromCache,
  getUsersFromCache,
  updateUserFollowersInRedisCache,
  updateBlockedUserPropInRedisCache,
  updateNotificationSettingInCache
} from '@redis/user-cache';
import { existingUser } from '@mock/user.mock';

jest.useFakeTimers();

describe('UserCache', () => {
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

  describe('saveUserToRedisCache', () => {
    it('should add user', async () => {
      await expect(saveUserToRedisCache('60263f14648fed5246e322d9', '123', existingUser as any)).resolves.toBeUndefined();
    });
  });

  describe('getUserFromCache', () => {
    it('should get user', async () => {
      delete existingUser.password;
      delete existingUser.passwordResetExpires;
      delete existingUser.passwordResetToken;
      existingUser.createdAt = new Date();
      await saveUserToRedisCache('60263f14648fed5246e322d9', '123', existingUser as any);
      await expect(getUserFromCache('60263f14648fed5246e322d9')).resolves.toStrictEqual(existingUser);
    });
  });

  describe('getUsersFromCache', () => {
    it('should get users', async () => {
      delete existingUser.password;
      delete existingUser.passwordResetExpires;
      delete existingUser.passwordResetToken;
      existingUser.createdAt = new Date();
      await saveUserToRedisCache('60263f14648fed5246e322d9', '123', existingUser as any);
      await saveUserToRedisCache('60263f14648fed5246e322d0', '123', existingUser as any);
      await expect(getUsersFromCache(0, 1, '60263f14648fed5246e322d9')).resolves.toStrictEqual([existingUser]);
    });
  });

  describe('updateUserFollowersInRedisCache', () => {
    it('should update follower', async () => {
      await saveUserToRedisCache('60263f14648fed5246e322d9', '123', existingUser as any);
      await expect(updateUserFollowersInRedisCache('60263f14648fed5246e322d9', 'followersCount', 1)).resolves.toBeUndefined();
    });
  });

  describe('updateBlockedUserPropInRedisCache', () => {
    it('should update user blockedBy list', async () => {
      await saveUserToRedisCache('60263f14648fed5246e322d9', '123', existingUser as any);
      await saveUserToRedisCache('60263f14648fed5246e322d0', '123', existingUser as any);
      await expect(
        updateBlockedUserPropInRedisCache('60263f14648fed5246e322d9', 'blockedBy', '60263f14648fed5246e322d0', 'block')
      ).resolves.toBeUndefined();
    });

    it('should update user blocked list', async () => {
      await saveUserToRedisCache('60263f14648fed5246e322d9', '123', existingUser as any);
      await saveUserToRedisCache('60263f14648fed5246e322d0', '123', existingUser as any);
      await expect(
        updateBlockedUserPropInRedisCache('60263f14648fed5246e322d0', 'blocked', '60263f14648fed5246e322d9', 'block')
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
      await saveUserToRedisCache('60263f14648fed5246e322d9', '123', existingUser as any);
      await expect(updateNotificationSettingInCache('60263f14648fed5246e322d9', 'notifications', settings)).resolves.toBeUndefined();
    });
  });
});
