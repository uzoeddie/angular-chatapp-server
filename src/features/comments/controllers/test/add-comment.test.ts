import { Request, Response } from 'express';
import redis, { RedisClient } from 'redis-mock';
import { authUserPayload } from '@root/mocks/auth.mock';
import { Add } from '@comments/controllers/add-comment';
import { commentMockRequest, commentMockResponse } from '@mock/comment.mock';
import * as cache from '@redis/comments-cache';
import { commentQueue } from '@queues/comment.queue';

jest.useFakeTimers();
jest.mock('@queues/comment.queue');
jest.mock('@redis/comments-cache');

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

  afterAll((done) => {
    done();
  });

  it('should send correct json response', async () => {
    const req: Request = commentMockRequest(
      {},
      {
        postId: '6027f77087c9d9ccb1555268',
        comment: 'This is a comment',
        profilePicture: 'https://res.cloudinary.com/ratingapp/image/upload/6064793b091bf02b6a71067a',
        userTo: '60263f14648fed5246e322d9'
      },
      authUserPayload
    ) as Request;
    const res: Response = commentMockResponse();
    jest.spyOn(cache, 'savePostCommentToRedisCache');
    jest.spyOn(commentQueue, 'addCommentJob');

    await Add.prototype.comment(req, res);
    expect(cache.savePostCommentToRedisCache).toHaveBeenCalled();
    expect(commentQueue.addCommentJob).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Comment created successfully'
    });
  });
});
