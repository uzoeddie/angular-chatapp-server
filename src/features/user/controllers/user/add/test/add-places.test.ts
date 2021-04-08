import { Request, Response } from 'express';
import { authUserPayload, IAuthMock, authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
import { socketIOUserObject } from '@sockets/users';
import { Server } from 'socket.io';
import { userInfoQueue } from '@queues/user-info.queue';
import { AddPlacesLived } from '@user/controllers/user/add/add-places';

jest.useFakeTimers();
jest.mock('@sockets/users');
jest.mock('@redis/user-info-cache');

(socketIOUserObject as Server) = new Server();

describe('AddPlacesLived', () => {
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

  describe('places', () => {
    it('should call "emit" and "addUserInfoJob" methods', async () => {
      const placesLived: IAuthMock = {
        city: 'Dusseldorf',
        country: 'Germany',
        year: '2021',
        month: 'March'
      };
      const req: Request = authMockRequest({}, placesLived, authUserPayload) as Request;
      const res: Response = authMockResponse();
      jest.spyOn(socketIOUserObject, 'emit');
      jest.spyOn(userInfoQueue, 'addUserInfoJob');

      await AddPlacesLived.prototype.places(req, res);
      expect(socketIOUserObject.emit).toHaveBeenCalled();
      expect(userInfoQueue.addUserInfoJob).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Places updated successfully'
      });
    });
  });
});
