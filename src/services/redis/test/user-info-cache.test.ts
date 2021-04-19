/* eslint-disable @typescript-eslint/no-explicit-any */
import redis, { RedisClient } from 'redis-mock';
import MockDate from 'mockdate';
import { userCache } from '@redis/user-cache';
import { existingUser } from '@mock/user.mock';
import { userInfoCache } from '@redis/user-info-cache';
import { IUserPlacesLived } from '@user/interface/user.interface';

jest.useFakeTimers();

describe('UserInfoCache', () => {
  let client: RedisClient;
  beforeEach(() => {
    jest.restoreAllMocks();
    MockDate.set('2021-04-04');
    client = redis.createClient({ host: '127.0.0.1', port: 6379 });
    delete existingUser.password;
    delete existingUser.passwordResetExpires;
    delete existingUser.passwordResetToken;
    existingUser.createdAt = new Date();
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

  describe('updateSingleUserItemInRedisCache', () => {
    it('should update user item', async () => {
      await userCache.saveUserToRedisCache('60263f14648fed5246e322d9', '123', existingUser as any);
      existingUser.gender = 'Female';
      await expect(userInfoCache.updateSingleUserItemInRedisCache('60263f14648fed5246e322d9', 'gender', 'Female')).resolves.toStrictEqual(
        existingUser
      );
    });
  });

  describe('updateUserPropListInfoInRedisCache', () => {
    it('should update user item', async () => {
      const placesLived: IUserPlacesLived = {
        _id: '60263f2d648fed5246e322d1',
        city: 'London',
        country: 'England',
        year: '2020',
        month: 'March'
      };
      await userCache.saveUserToRedisCache('60263f14648fed5246e322d9', '123', existingUser as any);
      existingUser.placesLived = [...existingUser.placesLived, placesLived];
      await expect(
        userInfoCache.updateUserPropListInfoInRedisCache('60263f14648fed5246e322d9', 'placesLived', placesLived, 'add')
      ).resolves.toEqual(existingUser);
    });
  });
});
