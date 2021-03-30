import { Request, Response } from 'express';
import { authMockRequest, authMockResponse } from '@mock/auth.mock';
import mongoose from 'mongoose';
import { mailTransport } from '@email/mail-transport';
import { Password } from '@user/controllers/auth/password';
import { CustomError } from '@global/error-handler';
import { existingUser } from '@mock/user.mock';

jest.mock('@redis/user-cache');
jest.mock('@email/mail-transport');

describe('Password', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should throw an error if email is invalid', () => {
      const req: Request = authMockRequest({}, { email: 'test' }) as Request;
      const res: Response = authMockResponse();
      Password.prototype.create(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Field must be valid');
      });
    });

    it('should throw "Invalid credential" if email does not exist', () => {
      const req: Request = authMockRequest({}, { email: 'test@email.com' }) as Request;
      const res: Response = authMockResponse();
      jest.spyOn(mongoose.Query.prototype, 'exec').mockResolvedValueOnce(null);
      Password.prototype.create(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Invalid credential');
      });
    });

    it('should call sendMail method', async () => {
      const req: Request = authMockRequest({}, { email: 'manny@me.com' }) as Request;
      const res: Response = authMockResponse();
      const mockUser = {
        ...existingUser,
        save: () => Promise.resolve(existingUser)
      };
      jest.spyOn(mailTransport, 'sendEmail');
      jest.spyOn(mongoose.Query.prototype, 'exec').mockResolvedValueOnce(mockUser);
      await Password.prototype.create(req, res);
      expect(mailTransport.sendEmail).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Password reset email sent.',
        user: {},
        token: '',
        notification: false
      });
    });
  });

  describe('update', () => {
    it('should throw an error if password is empty', () => {
      const req: Request = authMockRequest({}, { password: '' }) as Request;
      const res: Response = authMockResponse();
      Password.prototype.update(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Password is a required field');
      });
    });

    it('should throw an error if password and cpassword are different', () => {
      const req: Request = authMockRequest({}, { password: 'manny1', cpassword: 'manny2' }) as Request;
      const res: Response = authMockResponse();
      Password.prototype.update(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Passwords should match');
      });
    });

    it('should throw error if reset token has expired', () => {
      const req: Request = authMockRequest({}, { password: 'manny1', cpassword: 'manny1' }, null, { token: '' }) as Request;
      const res: Response = authMockResponse();
      jest.spyOn(mongoose.Query.prototype, 'exec').mockResolvedValueOnce(null);
      Password.prototype.update(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Reset token has expired.');
      });
    });

    it('should call sendMail method and send correct json response', async () => {
      const req: Request = authMockRequest({}, { password: 'manny1', cpassword: 'manny1' }, null, { token: '12sde3' }) as Request;
      const res: Response = authMockResponse();
      const mockUser = {
        ...existingUser,
        save: () => Promise.resolve(existingUser)
      };
      jest.spyOn(mailTransport, 'sendEmail');
      jest.spyOn(mongoose.Query.prototype, 'exec').mockResolvedValueOnce(mockUser);
      await Password.prototype.update(req, res);
      expect(mailTransport.sendEmail).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Password successfully updated.',
        user: {},
        token: '',
        notification: false
      });
    });
  });
});
