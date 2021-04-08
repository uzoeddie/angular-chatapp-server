import { Request, Response } from 'express';
import { authUserPayload, authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
import { socketIOUserObject } from '@sockets/users';
import { Server } from 'socket.io';
import { userInfoQueue } from '@queues/user-info.queue';
import { DeletePlacesLived } from '@user/controllers/user/delete/delete-places';

jest.useFakeTimers();
jest.mock('@sockets/users');
jest.mock('@redis/user-info-cache');

(socketIOUserObject as Server) = new Server();

describe('DeletePlacesLived', () => {
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
      const req: Request = authMockRequest({}, {}, authUserPayload, { placeId: '12345' }) as Request;
      const res: Response = authMockResponse();
      jest.spyOn(socketIOUserObject, 'emit');
      jest.spyOn(userInfoQueue, 'addUserInfoJob');

      await DeletePlacesLived.prototype.places(req, res);
      expect(socketIOUserObject.emit).toHaveBeenCalled();
      expect(userInfoQueue.addUserInfoJob).toHaveBeenCalledWith('updateUserPlaceInCache', {
        key: 'Manny',
        value: null,
        type: 'remove',
        paramsId: '12345'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Place deleted successfully'
      });
    });
  });
});
