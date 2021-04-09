/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import redis, { RedisClient } from 'redis-mock';
import { authUserPayload } from '@root/mocks/auth.mock';
import { followersMockRequest, followersMockResponse } from '@mock/followers.mock';
import { followerQueue } from '@queues/follower.queue';
import { existingUser } from '@mock/user.mock';
import { Remove } from '@followers/controllers/unfollow-user';

jest.useFakeTimers();
jest.mock('@queues/follower.queue');

describe('Remove', () => {
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

  it('should send correct json response', async () => {
    const req: Request = followersMockRequest({}, authUserPayload, { followerId: '6064861bc25eaa5a5d2f9bf4' }) as Request;
    const res: Response = followersMockResponse();
    jest.spyOn(Promise, 'all').mockImplementation((): any => [existingUser, existingUser]);
    jest.spyOn(followerQueue, 'addFollowerJob');

    await Remove.prototype.following(req, res);
    expect(followerQueue.addFollowerJob).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Unfollowed user now'
    });
  });
});
