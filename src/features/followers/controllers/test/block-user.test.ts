import { Request, Response } from 'express';
import redis, { RedisClient } from 'redis-mock';
import { authUserPayload } from '@root/mocks/auth.mock';
import { followersMockRequest, followersMockResponse } from '@mock/followers.mock';
import { userQueue } from '@queues/user.queue';
import { Block } from '@followers/controllers/block-user';

jest.useFakeTimers();
jest.mock('@queues/user.queue');
jest.mock('@redis/user-cache');

describe('Block', () => {
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

  describe('block', () => {
    it('should send correct json response', async () => {
      const req: Request = followersMockRequest({}, authUserPayload, { followerId: '6064861bc25eaa5a5d2f9bf4' }) as Request;
      const res: Response = followersMockResponse();
      jest.spyOn(userQueue, 'addUserJob');

      await Block.prototype.block(req, res);
      expect(userQueue.addUserJob).toHaveBeenCalledWith('addBlockedUserToDB', {
        keyOne: `${req.currentUser?.userId}`,
        keyTwo: `${req.params.followerId}`
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User blocked'
      });
    });
  });

  describe('unblock', () => {
    it('should send correct json response', async () => {
      const req: Request = followersMockRequest({}, authUserPayload, { followerId: '6064861bc25eaa5a5d2f9bf4' }) as Request;
      const res: Response = followersMockResponse();
      jest.spyOn(userQueue, 'addUserJob');

      await Block.prototype.unblock(req, res);
      expect(userQueue.addUserJob).toHaveBeenCalledWith('removeUnblockedUserFromDB', {
        keyOne: `${req.currentUser?.userId}`,
        keyTwo: `${req.params.followerId}`
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User unblocked'
      });
    });
  });
});
