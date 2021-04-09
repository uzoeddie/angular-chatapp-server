import { Request, Response } from 'express';
import redis, { RedisClient } from 'redis-mock';
import { Server } from 'socket.io';
import { authUserPayload } from '@root/mocks/auth.mock';
import { Delete } from '@notifications/controllers/delete-notification';
import { socketIONotificationObject } from '@sockets/notifications';
import { notificationQueue } from '@queues/notification.queue';
import { notificationMockRequest, notificationMockResponse } from '@mock/notification.mock';

jest.useFakeTimers();
jest.mock('@sockets/notifications');
jest.mock('@queues/notification.queue');

(socketIONotificationObject as Server) = new Server();

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
    const req: Request = notificationMockRequest({}, authUserPayload, { notificationId: '12345' }) as Request;
    const res: Response = notificationMockResponse();
    jest.spyOn(socketIONotificationObject, 'emit');
    jest.spyOn(notificationQueue, 'addNotificationJob');

    await Delete.prototype.notification(req, res);
    expect(socketIONotificationObject.emit).toHaveBeenCalled();
    expect(notificationQueue.addNotificationJob).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Notification deleted successfully'
    });
  });
});
