/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import redis, { RedisClient } from 'redis-mock';
import { Server } from 'socket.io';
import { authUserPayload } from '@root/mocks/auth.mock';
import { imagesMockRequest, imagesMockResponse } from '@mock/image.mock';
import { Delete } from '@images/controllers/delete-image';
import { socketIOImageObject } from '@sockets/images';
import { imageQueue } from '@queues/image.queue';

jest.useFakeTimers();
jest.mock('@sockets/images');
jest.mock('@queues/image.queue');

(socketIOImageObject as Server) = new Server();

describe('Delete', () => {
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
    const req: Request = imagesMockRequest({}, {}, authUserPayload, { imageId: '12345' }) as Request;
    const res: Response = imagesMockResponse();
    jest.spyOn(socketIOImageObject, 'emit');
    jest.spyOn(imageQueue, 'addImageJob');

    await Delete.prototype.image(req, res);
    expect(socketIOImageObject.emit).toHaveBeenCalled();
    expect(imageQueue.addImageJob).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Image delete successfully'
    });
  });
});
