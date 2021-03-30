import { Request, Response } from 'express';
import { authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
import mongoose from 'mongoose';
import { CustomError } from '@global/error-handler';
import { ChangePassword } from '@user/controllers/user/edit/change-password';
import { UserModel } from '@user/models/user.schema';
import { existingUser } from '@mock/user.mock';

jest.useFakeTimers();
jest.mock('@redis/user-cache');
jest.mock('@email/mail-transport');

describe('ChangePassword', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('update', () => {
    it('should throw an error if currentPassword is empty', () => {
      const req: Request = authMockRequest(
        {},
        {
          currentPassword: '',
          newPassword: 'manny2',
          confirmPassword: 'manny2'
        }
      ) as Request;
      const res: Response = authMockResponse();
      ChangePassword.prototype.update(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Password is a required field');
      });
    });

    it('should throw an error if newPassword is empty', () => {
      const req: Request = authMockRequest(
        {},
        {
          currentPassword: 'manny1',
          newPassword: '',
          confirmPassword: 'manny2'
        }
      ) as Request;
      const res: Response = authMockResponse();
      ChangePassword.prototype.update(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Password is a required field');
      });
    });

    it('should throw an error if confirmPassword is empty', () => {
      const req: Request = authMockRequest(
        {},
        {
          currentPassword: 'manny1',
          newPassword: 'manny2',
          confirmPassword: ''
        }
      ) as Request;
      const res: Response = authMockResponse();
      ChangePassword.prototype.update(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Confirm password does not match new password.');
      });
    });

    it('should throw an error if currentPassword does not exist', () => {
      const req: Request = authMockRequest(
        {},
        {
          currentPassword: 'manny1',
          newPassword: 'manny2',
          confirmPassword: 'manny2'
        }
      ) as Request;
      const res: Response = authMockResponse();
      const mockUser = {
        ...existingUser,
        comparePassword: () => false
      };
      jest.spyOn(mongoose.Query.prototype, 'exec').mockResolvedValueOnce(mockUser);

      ChangePassword.prototype.update(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Invalid credentials');
      });
    });

    it('should call UserModel "updateOne" method', async () => {
      const req: Request = authMockRequest(
        {},
        {
          currentPassword: 'manny1',
          newPassword: 'manny2',
          confirmPassword: 'manny2'
        }
      ) as Request;
      const res: Response = authMockResponse();
      const mockUser = {
        ...existingUser,
        comparePassword: () => true,
        hashPassword: () => 'djejdjr123482ejsj'
      };
      jest.spyOn(UserModel, 'updateOne').mockResolvedValueOnce(mockUser);
      jest.spyOn(mongoose.Query.prototype, 'exec').mockResolvedValueOnce(mockUser);

      await ChangePassword.prototype.update(req, res);
      expect(UserModel.updateOne).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Password updated successfully. You will be redirected shortly to the login page.',
        notification: true
      });
    });
  });
});
