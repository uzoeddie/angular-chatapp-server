import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { SignIn } from '@user/controllers/auth/signin';
import { CustomError } from '@global/error-handler';
import { UserModel } from '@user/models/user.schema';
import { Helpers } from '@global/helpers';
import { authMockRequest, authMockResponse } from '@mock/auth.mock';
import { existingUser } from '@mock/user.mock';

describe('SignIn', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    jest.clearAllMocks();
  });

  it('should throw an error if username is not available', () => {
    const req: Request = authMockRequest({}, { username: '', password: 'manny1' }) as Request;
    const res: Response = authMockResponse();
    SignIn.prototype.read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Username is a required field');
    });
  });

  it('should throw an error if username length is less than minimum length', () => {
    const req: Request = authMockRequest({}, { username: 'ma', password: 'ma' }) as Request;
    const res: Response = authMockResponse();
    SignIn.prototype.read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Username must have a minimum length of 4');
    });
  });

  it('should throw an error if username length is greater than maximum length', () => {
    const req: Request = authMockRequest({}, { username: 'mathematics', password: 'ma' }) as Request;
    const res: Response = authMockResponse();
    SignIn.prototype.read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Username should have a maximum length of 8');
    });
  });

  it('should throw an error if password is not available', () => {
    const req: Request = authMockRequest({}, { username: 'manny', password: '' }) as Request;
    const res: Response = authMockResponse();
    SignIn.prototype.read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Password is a required field');
    });
  });

  it('should throw an error if password length is less than minimum length', () => {
    const req: Request = authMockRequest({}, { username: 'manny', password: 'ma' }) as Request;
    const res: Response = authMockResponse();
    SignIn.prototype.read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Password must have a minimum length of 4');
    });
  });

  it('should throw an error if password length is greater than maximum length', () => {
    const req: Request = authMockRequest({}, { username: 'manny', password: 'mathematics1' }) as Request;
    const res: Response = authMockResponse();
    SignIn.prototype.read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Password should have a maximum length of 8');
    });
  });

  it('should throw "Invalid credentials" if username does not exist', () => {
    const req: Request = authMockRequest({}, { username: 'manny', password: 'manny1' }) as Request;
    const res: Response = authMockResponse();
    jest.spyOn(UserModel, 'findOne');
    jest.spyOn(mongoose.Query.prototype, 'exec').mockResolvedValueOnce(null);

    SignIn.prototype.read(req, res).catch((error: CustomError) => {
      expect(UserModel.findOne).toHaveBeenCalledWith({ username: Helpers.firstLetterUppercase(req.body.username) });
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid credentials');
    });
  });

  it('should throw "Invalid credentials" if password does not exist', () => {
    const req: Request = authMockRequest({}, { username: 'manny', password: 'manny1' }) as Request;
    const res: Response = authMockResponse();
    const mockUser = {
      ...existingUser,
      comparePassword: () => false
    };
    jest.spyOn(UserModel, 'findOne');
    jest.spyOn(mongoose.Query.prototype, 'exec').mockResolvedValueOnce(mockUser);

    SignIn.prototype.read(req, res).catch((error: CustomError) => {
      expect(UserModel.findOne).toHaveBeenCalledWith({ username: Helpers.firstLetterUppercase(req.body.username) });
      expect(mockUser.comparePassword()).toEqual(false);
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid credentials');
    });
  });

  it('should set session data for valid credentials and send correct json response', async () => {
    const req: Request = authMockRequest({}, { username: 'manny', password: 'manny1' }) as Request;
    const res: Response = authMockResponse();
    const mockUser = {
      ...existingUser,
      comparePassword: () => true
    };
    jest.spyOn(UserModel, 'findOne');
    jest.spyOn(mongoose.Query.prototype, 'exec').mockResolvedValueOnce(mockUser);

    await SignIn.prototype.read(req, res);
    expect(req.session?.jwt).toBeDefined();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User login successfully',
      user: mockUser,
      token: req.session?.jwt,
      notification: false
    });
  });
});
