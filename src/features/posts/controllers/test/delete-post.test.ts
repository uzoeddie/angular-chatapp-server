import { Request, Response } from 'express';
import redis, { RedisClient } from 'redis-mock';
import { Server } from 'socket.io';
import { authUserPayload } from '@root/mocks/auth.mock';
import { socketIOPostObject } from '@sockets/posts';
import { postQueue } from '@queues/post.queue';
import { newPost, postMockRequest, postMockResponse } from '@mock/post.mock';
import { Delete } from '@posts/controllers/delete-post';

jest.useFakeTimers();
jest.mock('@sockets/posts');
jest.mock('@queues/post.queue');
jest.mock('@redis/post-cache');

(socketIOPostObject as Server) = new Server();

describe('Delete', () => {
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
    const req: Request = postMockRequest(newPost, authUserPayload, { postId: '12345' }) as Request;
    const res: Response = postMockResponse();
    jest.spyOn(socketIOPostObject, 'emit');
    jest.spyOn(postQueue, 'addPostJob');

    await Delete.prototype.post(req, res);
    expect(socketIOPostObject.emit).toHaveBeenCalled();
    expect(postQueue.addPostJob).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Post deleted successfully',
      notification: true
    });
  });
});
