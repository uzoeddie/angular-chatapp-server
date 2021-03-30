import { Request, Response } from 'express';
import { authUserPayload, authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
import { socketIOUserObject } from '@sockets/users';
import { Server } from 'socket.io';
import { userInfoQueue } from '@queues/user-info.queue';
import { DeleteWorkAndEducation } from '@user/controllers/user/delete/delete-work-and-education';

jest.useFakeTimers();
jest.mock('@sockets/users');
jest.mock('@redis/user-info-cache');

(socketIOUserObject as Server) = new Server();

describe('DeleteWorkAndEducation', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('work', () => {
    it('should call "emit" and "addUserInfoJob" methods', async () => {
      const req: Request = authMockRequest({}, {}, authUserPayload, { workId: '12345' }) as Request;
      const res: Response = authMockResponse();
      jest.spyOn(socketIOUserObject, 'emit');
      jest.spyOn(userInfoQueue, 'addUserInfoJob');

      await DeleteWorkAndEducation.prototype.work(req, res);
      expect(socketIOUserObject.emit).toHaveBeenCalled();
      expect(userInfoQueue.addUserInfoJob).toHaveBeenCalledWith('updateUserWorkInCache', {
        key: 'Manny',
        value: null,
        type: 'remove',
        paramsId: '12345'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Work deleted successfully',
        notification: true
      });
    });
  });

  describe('education', () => {
    it('should call "emit" and "addUserInfoJob" methods', async () => {
      const req: Request = authMockRequest({}, {}, authUserPayload, { schoolId: '12345' }) as Request;
      const res: Response = authMockResponse();
      jest.spyOn(socketIOUserObject, 'emit');
      jest.spyOn(userInfoQueue, 'addUserInfoJob');

      await DeleteWorkAndEducation.prototype.education(req, res);
      expect(socketIOUserObject.emit).toHaveBeenCalled();
      expect(userInfoQueue.addUserInfoJob).toHaveBeenCalledWith('updateUserSchoolInCache', {
        key: 'Manny',
        value: null,
        type: 'remove',
        paramsId: '12345'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'School deleted successfully',
        notification: true
      });
    });
  });
});
