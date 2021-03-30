import { Request, Response } from 'express';
import { authUserPayload, authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
import { socketIOUserObject } from '@sockets/users';
import { Server } from 'socket.io';
import { userInfoQueue } from '@queues/user-info.queue';
import { EditWorkAndEducation } from '@user/controllers/user/edit/edit-work-and-education';

jest.useFakeTimers();
jest.mock('@sockets/users');
jest.mock('@redis/user-info-cache');

(socketIOUserObject as Server) = new Server();

describe('EditWorkAndEducation', () => {
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
        _id: '12345',
        company: 'KickChat',
        position: 'CEO/Co-Founder',
        city: 'Berlin',
        description: 'I am the CEO',
        from: '2021',
        to: 'Present'
      };
      const req: Request = authMockRequest({}, work, authUserPayload, { workId: '12345' }) as Request;
      const res: Response = authMockResponse();
      jest.spyOn(socketIOUserObject, 'emit');
      jest.spyOn(userInfoQueue, 'addUserInfoJob');

      await EditWorkAndEducation.prototype.work(req, res);
      expect(socketIOUserObject.emit).toHaveBeenCalled();
      expect(userInfoQueue.addUserInfoJob).toHaveBeenCalledWith('updateUserWorkInCache', {
        key: 'Manny',
        value: work,
        type: 'edit',
        paramsId: '12345'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Work updated successfully'
      });
    });
  });

  describe('education', () => {
    it('should call "emit" and "addUserInfoJob" methods', async () => {
      const school = {
        _id: '12345',
        name: 'Tallinn Tech',
        course: 'Computer Engineering',
        degree: 'M.Sc',
        from: '2014',
        to: '2016'
      };
      const req: Request = authMockRequest({}, school, authUserPayload, { schoolId: '12345' }) as Request;
      const res: Response = authMockResponse();
      jest.spyOn(socketIOUserObject, 'emit');
      jest.spyOn(userInfoQueue, 'addUserInfoJob');

      await EditWorkAndEducation.prototype.education(req, res);
      expect(socketIOUserObject.emit).toHaveBeenCalled();
      expect(userInfoQueue.addUserInfoJob).toHaveBeenCalledWith('updateUserSchoolInCache', {
        key: 'Manny',
        value: school,
        type: 'edit',
        paramsId: '12345'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Education updated successfully'
      });
    });
  });
});
