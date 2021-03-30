import { Request, Response } from 'express';
import { authUserPayload, authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
import { socketIOUserObject } from '@sockets/users';
import { Server } from 'socket.io';
import { userInfoQueue } from '@queues/user-info.queue';
import { AddWorkAndEducation } from '@user/controllers/user/add/add-work-and-education';

jest.useFakeTimers();
jest.mock('@sockets/users');
jest.mock('@redis/user-info-cache');

(socketIOUserObject as Server) = new Server();

describe('AddWorkAndEducation', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('work', () => {
    it('should call "emit" and "addUserInfoJob" methods', async () => {
      const work = {
        company: 'KickChat',
        position: 'CEO',
        city: 'Berlin',
        description: '',
        from: '2021',
        to: 'Present'
      };
      const req: Request = authMockRequest({}, work, authUserPayload) as Request;
      const res: Response = authMockResponse();
      jest.spyOn(socketIOUserObject, 'emit');
      jest.spyOn(userInfoQueue, 'addUserInfoJob');

      await AddWorkAndEducation.prototype.work(req, res);
      expect(socketIOUserObject.emit).toHaveBeenCalled();
      expect(userInfoQueue.addUserInfoJob).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Work updated successfully'
      });
    });
  });

  describe('education', () => {
    it('should call "emit" and "addUserInfoJob" methods', async () => {
      const school = {
        name: 'Tallinn Tech',
        course: 'Computer Engineering',
        degree: 'M.Sc',
        from: '2014',
        to: '2016'
      };
      const req: Request = authMockRequest({}, school, authUserPayload) as Request;
      const res: Response = authMockResponse();
      jest.spyOn(socketIOUserObject, 'emit');
      jest.spyOn(userInfoQueue, 'addUserInfoJob');

      await AddWorkAndEducation.prototype.education(req, res);
      expect(socketIOUserObject.emit).toHaveBeenCalled();
      expect(userInfoQueue.addUserInfoJob).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Education updated successfully'
      });
    });
  });
});
