import { Request, Response } from 'express';
import { authUserPayload, authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
import { Settings } from '@user/controllers/user/edit/update-settings';
import { userQueue } from '@queues/user.queue';

jest.useFakeTimers();
jest.mock('@redis/user-info-cache');

describe('Settings', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  afterAll((done) => {
    done();
  });

  describe('update', () => {
    it('should call "addUserJob" methods', async () => {
      const settings = {
        messages: true,
        reactions: false,
        comments: true,
        follows: false
      };
      const req: Request = authMockRequest({}, settings, authUserPayload) as Request;
      const res: Response = authMockResponse();
      jest.spyOn(userQueue, 'addUserJob');

      await Settings.prototype.update(req, res);
      expect(userQueue.addUserJob).toHaveBeenCalledWith('updateNotificationSettings', {
        key: 'Manny',
        value: settings
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Notification settings updated successfully.',
        notification: true,
        settings: settings
      });
    });
  });
});
