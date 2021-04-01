/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import redis, { RedisClient } from 'redis-mock';
import { Server } from 'socket.io';
import { authUserPayload } from '@root/mocks/auth.mock';
import { followersMockRequest, followersMockResponse } from '@mock/followers.mock';
import { Add } from '@followers/controllers/follow-user';
import { socketIOFollowerObject } from '@sockets/follower';
import { followerQueue } from '@queues/follower.queue';
import { existingUser } from '@mock/user.mock';

jest.useFakeTimers();
jest.mock('@queues/follower.queue');
jest.mock('@redis/follower-cache');
jest.mock('@sockets/users');
jest.mock('@redis/user-cache');

(socketIOFollowerObject as Server) = new Server();

describe('Add', () => {
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

  it('should send correct json response', async () => {
    const req: Request = followersMockRequest({}, authUserPayload, { followerId: '6064861bc25eaa5a5d2f9bf4' }) as Request;
    const res: Response = followersMockResponse();
    jest.spyOn(Promise, 'all').mockImplementation((): any => [existingUser, existingUser]);
    jest.spyOn(socketIOFollowerObject, 'emit');
    jest.spyOn(followerQueue, 'addFollowerJob');

    await Add.prototype.follower(req, res);
    expect(followerQueue.addFollowerJob).toHaveBeenCalled();
    expect(socketIOFollowerObject.emit).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Following user now',
      notification: true
    });
  });
});
