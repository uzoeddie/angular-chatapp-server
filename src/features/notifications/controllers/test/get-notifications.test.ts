import { Request, Response } from 'express';
import redis, { RedisClient } from 'redis-mock';
import mongoose from 'mongoose';
import { authUserPayload } from '@root/mocks/auth.mock';
import { notificationData, notificationMockRequest, notificationMockResponse } from '@mock/notification.mock';
import { Get } from '@notifications/controllers/get-notifications';
import { NotificationModel } from '@notifications/models/notification.schema';

jest.useFakeTimers();

describe('Get', () => {
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
    const req: Request = notificationMockRequest({}, authUserPayload, { notificationId: '12345' }) as Request;
    const res: Response = notificationMockResponse();
    jest.spyOn(NotificationModel, 'find');
    jest.spyOn(mongoose.Query.prototype, 'exec').mockResolvedValueOnce([notificationData]);

    await Get.prototype.notification(req, res);
    expect(NotificationModel.find).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User notifications',
      notifications: [notificationData]
    });
  });
});
