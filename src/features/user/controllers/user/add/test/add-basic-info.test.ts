import { Request, Response } from 'express';
import { CustomError } from '@global/error-handler';
import { authUserPayload, authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
import { AddBasicInfo } from '@user/controllers/user/add/add-basic-info';
import { socketIOUserObject } from '@sockets/users';
import { Server } from 'socket.io';
import { userInfoQueue } from '@queues/user-info.queue';

jest.useFakeTimers();
jest.mock('@sockets/users');
jest.mock('@redis/user-info-cache');

(socketIOUserObject as Server) = new Server();

describe('AddBasicInfo', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('gender', () => {
    it('should throw an error if gender is invalid', () => {
      const req: Request = authMockRequest({}, { gender: '' }) as Request;
      const res: Response = authMockResponse();
      AddBasicInfo.prototype.gender(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('"gender" is not allowed to be empty');
      });
    });

    it('should call "emit" and "addUserInfoJob" methods', async () => {
      const req: Request = authMockRequest({}, { gender: 'Male' }, authUserPayload) as Request;
      const res: Response = authMockResponse();
      jest.spyOn(socketIOUserObject, 'emit');
      jest.spyOn(userInfoQueue, 'addUserInfoJob');

      await AddBasicInfo.prototype.gender(req, res);
      expect(socketIOUserObject.emit).toHaveBeenCalled();
      expect(userInfoQueue.addUserInfoJob).toHaveBeenCalledWith('updateGenderInCache', { key: 'Manny', value: 'Male' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Gender updated successfully'
      });
    });
  });

  describe('birthday', () => {
    it('should throw an error if month is invalid', () => {
      const req: Request = authMockRequest({}, { month: '', day: '' }) as Request;
      const res: Response = authMockResponse();
      AddBasicInfo.prototype.birthday(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('"month" is not allowed to be empty');
      });
    });

    it('should throw an error if day is invalid', () => {
      const req: Request = authMockRequest({}, { month: 'March', day: '' }) as Request;
      const res: Response = authMockResponse();
      AddBasicInfo.prototype.birthday(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('"day" is not allowed to be empty');
      });
    });

    it('should call "emit" and "addUserInfoJob" methods', async () => {
      const req: Request = authMockRequest({}, { month: 'March', day: '10' }, authUserPayload) as Request;
      const res: Response = authMockResponse();
      jest.spyOn(socketIOUserObject, 'emit');
      jest.spyOn(userInfoQueue, 'addUserInfoJob');

      await AddBasicInfo.prototype.birthday(req, res);
      expect(socketIOUserObject.emit).toHaveBeenCalled();
      expect(userInfoQueue.addUserInfoJob).toHaveBeenCalledWith('updateBirthdayInCache', { key: 'Manny', value: { month: 'March', day: '10' } });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Birthday updated successfully'
      });
    });
  });

  describe('relationship', () => {
    it('should throw an error if relationship is invalid', () => {
      const req: Request = authMockRequest({}, { relationship: '' }) as Request;
      const res: Response = authMockResponse();
      AddBasicInfo.prototype.relationship(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('"relationship" is not allowed to be empty');
      });
    });

    it('should call "emit" and "addUserInfoJob" methods', async () => {
      const req: Request = authMockRequest({}, { relationship: 'Single' }, authUserPayload) as Request;
      const res: Response = authMockResponse();
      jest.spyOn(socketIOUserObject, 'emit');
      jest.spyOn(userInfoQueue, 'addUserInfoJob');

      await AddBasicInfo.prototype.relationship(req, res);
      expect(socketIOUserObject.emit).toHaveBeenCalled();
      expect(userInfoQueue.addUserInfoJob).toHaveBeenCalledWith('updateRelationshipInCache', { key: 'Manny', value: 'Single' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Relationship updated successfully'
      });
    });
  });
});
