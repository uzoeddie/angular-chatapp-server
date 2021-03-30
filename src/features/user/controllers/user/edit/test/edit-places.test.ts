import { Request, Response } from 'express';
import { authUserPayload, IAuthMock, authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
import { socketIOUserObject } from '@sockets/users';
import { Server } from 'socket.io';
import { userInfoQueue } from '@queues/user-info.queue';
import { EditPlacesLived } from '@user/controllers/user/edit/edit-places';

jest.useFakeTimers();
jest.mock('@sockets/users');
jest.mock('@redis/user-info-cache');

(socketIOUserObject as Server) = new Server();

describe('EditPlacesLived', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('places', () => {
    it('should call "emit" and "addUserInfoJob" methods', async () => {
      const placesLived: IAuthMock = {
        _id: '12345',
        city: 'Dusseldorf',
        country: 'Germany',
        year: '2021',
        month: 'March'
      };
      const req: Request = authMockRequest({}, placesLived, authUserPayload, { placeId: '12345' }) as Request;
      const res: Response = authMockResponse();
      jest.spyOn(socketIOUserObject, 'emit');
      jest.spyOn(userInfoQueue, 'addUserInfoJob');

      await EditPlacesLived.prototype.places(req, res);
      expect(socketIOUserObject.emit).toHaveBeenCalled();
      expect(userInfoQueue.addUserInfoJob).toHaveBeenCalledWith('updateUserPlaceInCache', {
        key: 'Manny',
        value: placesLived,
        type: 'edit',
        paramsId: '12345'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Places updated successfully'
      });
    });
  });
});
