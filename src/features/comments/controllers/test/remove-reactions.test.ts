import { Request, Response } from 'express';
import redis, { RedisClient } from 'redis-mock';
import { authUserPayload } from '@root/mocks/auth.mock';
import { commentMockRequest, commentMockResponse } from '@mock/comment.mock';
import * as cache from '@redis/comments-cache';
import { Remove } from '@comments/controllers/remove-reactions';
import { reactionQueue } from '@queues/reaction.queue';
import { socketIOPostObject } from '@sockets/posts';
import { Server } from 'socket.io';

jest.useFakeTimers();
jest.mock('@queues/reaction.queue');
jest.mock('@redis/comments-cache');
jest.mock('@sockets/users');

(socketIOPostObject as Server) = new Server();

describe('Remove', () => {
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

  afterAll((done) => {
    done();
  });

  it('should send correct json response', async () => {
    const req: Request = commentMockRequest({}, {}, authUserPayload, {
      postId: '6027f77087c9d9ccb1555268',
      previousReaction: 'love'
    }) as Request;
    const res: Response = commentMockResponse();
    jest.spyOn(cache, 'removeReactionFromCache');
    jest.spyOn(reactionQueue, 'addReactionJob');
    jest.spyOn(socketIOPostObject, 'emit');

    await Remove.prototype.reaction(req, res);
    expect(socketIOPostObject.emit).toHaveBeenCalled();
    expect(cache.removeReactionFromCache).toHaveBeenCalled();
    expect(reactionQueue.addReactionJob).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Reaction removed from post'
    });
  });
});
