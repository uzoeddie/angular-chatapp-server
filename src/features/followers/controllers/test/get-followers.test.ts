/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import redis, { RedisClient } from 'redis-mock';
import mongoose from 'mongoose';
import { authUserPayload } from '@root/mocks/auth.mock';
import { followerData, followersMockRequest, followersMockResponse } from '@mock/followers.mock';
import * as cache from '@redis/follower-cache';
import { Get } from '@followers/controllers/get-followers';
import { FollowerModel } from '@followers/models/follower.schema';

jest.useFakeTimers();
jest.mock('@redis/follower-cache');

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
    mongoose.connection.close();
    done();
  });

  describe('following', () => {
    it('should send correct json response if follower exist in cache', async () => {
      const req: Request = followersMockRequest({}, authUserPayload) as Request;
      const res: Response = followersMockResponse();
      jest.spyOn(cache, 'getFollowersFromRedisCache').mockImplementation((): any => [followerData]);

      await Get.prototype.following(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User following',
        following: [followerData]
      });
    });

    it('should send correct json response if follower exist in database', async () => {
      const req: Request = followersMockRequest({}, authUserPayload) as Request;
      const res: Response = followersMockResponse();
      jest.spyOn(cache, 'getFollowersFromRedisCache').mockImplementation((): any => []);
      jest.spyOn(FollowerModel, 'find');
      jest.spyOn(mongoose.Query.prototype, 'exec').mockResolvedValueOnce([followerData]);

      await Get.prototype.following(req, res);
      expect(FollowerModel.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User following',
        following: [followerData]
      });
    });
  });

  describe('userFollowers', () => {
    it('should send correct json response if follower exist in cache', async () => {
      const req: Request = followersMockRequest({}, authUserPayload) as Request;
      const res: Response = followersMockResponse();
      jest.spyOn(cache, 'getFollowersFromRedisCache').mockImplementation((): any => [followerData]);

      await Get.prototype.following(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User following',
        following: [followerData]
      });
    });

    it('should send correct json response if follower exist in database', async () => {
      const req: Request = followersMockRequest({}, authUserPayload, { userId: '6064861bc25eaa5a5d2f9bf4' }) as Request;
      const res: Response = followersMockResponse();
      jest.spyOn(cache, 'getFollowersFromRedisCache').mockImplementation((): any => []);
      jest.spyOn(FollowerModel, 'find');
      jest.spyOn(mongoose.Query.prototype, 'exec').mockResolvedValueOnce([followerData]);

      await Get.prototype.userFollowers(req, res);
      expect(FollowerModel.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User followers',
        followers: [followerData]
      });
    });
  });
});
