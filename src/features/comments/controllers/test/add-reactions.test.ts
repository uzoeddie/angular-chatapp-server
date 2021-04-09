import { Request, Response } from 'express';
import redis, { RedisClient } from 'redis-mock';
import { authUserPayload } from '@root/mocks/auth.mock';
import { commentMockRequest, commentMockResponse } from '@mock/comment.mock';
import * as cache from '@redis/comments-cache';
import { reactionQueue } from '@queues/reaction.queue';
import { AddReaction } from '@comments/controllers/add-reactions';

jest.useFakeTimers();
jest.mock('@queues/reaction.queue');
jest.mock('@redis/comments-cache');

describe('AddReaction', () => {
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
    const req: Request = commentMockRequest(
      {},
      {
        postId: '6027f77087c9d9ccb1555268',
        previousReaction: 'love',
        profilePicture: '',
        userTo: '60263f14648fed5246e322d9',
        type: 'like'
      },
      authUserPayload
    ) as Request;
    const res: Response = commentMockResponse();
    jest.spyOn(cache, 'savePostReactionToRedisCache');
    jest.spyOn(reactionQueue, 'addReactionJob');

    await AddReaction.prototype.reaction(req, res);
    expect(cache.savePostReactionToRedisCache).toHaveBeenCalled();
    expect(reactionQueue.addReactionJob).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Like added to post successfully',
      notification: true
    });
  });
});
