/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { SignUp } from '@user/controllers/auth/signup';
import { CustomError } from '@global/error-handler';
import { authMockRequest, authMockResponse } from '@mock/auth.mock';
import { existingUser } from '@mock/user.mock';
// import { userQueue } from '@queues/user.queue';
import redis, { RedisClient } from 'redis-mock';
// import * as SignUpClass from '@user/controllers/auth/signup';
// import { uploads } from '@global/cloudinary-upload';
// import { saveUserToRedisCache } from '@redis/user-cache';
// import dotenv from 'dotenv';
// import { config } from '@root/config';
// import cloudinary from 'cloudinary';
// import Jimp from 'jimp';

// dotenv.config({});

// cloudinary.v2.config({
//   cloud_name: config.CLOUD_NAME,
//   api_key: config.CLOUD_API_KEY,
//   api_secret: config.CLOUD_API_SECRET
// });
// jest.useFakeTimers();
// jest.setTimeout(10000);
// // jest.mock('@global/cloudinary-upload');
// jest.mock('@redis/user-cache');
// jest.mock('jimp');

describe('SignUp', () => {
  let client: RedisClient;
  beforeEach(() => {
    jest.restoreAllMocks();
    client = redis.createClient();
  });

  afterEach((done) => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    client.flushall(done);
    client.quit(done);
  });

  it('should throw an error if username is not available', () => {
    const req: Request = authMockRequest({}, { username: '', email: 'manny@test.com', password: 'manny1' }) as Request;
    const res: Response = authMockResponse();
    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Username is a required field');
    });
  });

  it('should throw an error if username length is less than minimum length', () => {
    const req: Request = authMockRequest({}, { username: 'ma', email: 'manny@test.com', password: 'manny1' }) as Request;
    const res: Response = authMockResponse();
    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Username must have a minimum length of 4');
    });
  });

  it('should throw an error if username length is greater than maximum length', () => {
    const req: Request = authMockRequest({}, { username: 'mathematics', email: 'manny@test.com', password: 'manny1' }) as Request;
    const res: Response = authMockResponse();
    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Username should have a maximum length of 8');
    });
  });

  it('should throw an error if email is not valid', () => {
    const req: Request = authMockRequest({}, { username: 'manny', email: 'manny', password: 'manny1' }) as Request;
    const res: Response = authMockResponse();
    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Email must be a valid email');
    });
  });

  it('should throw an error if email is not available', () => {
    const req: Request = authMockRequest({}, { username: 'manny', email: '', password: 'manny1' }) as Request;
    const res: Response = authMockResponse();
    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Email is a required field');
    });
  });

  it('should throw an error if password is not available', () => {
    const req: Request = authMockRequest({}, { username: 'manny', email: 'manny@test.com', password: '' }) as Request;
    const res: Response = authMockResponse();
    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Password is a required field');
    });
  });

  it('should throw an error if password length is less than minimum length', () => {
    const req: Request = authMockRequest({}, { username: 'manny', email: 'manny@test.com', password: 'man' }) as Request;
    const res: Response = authMockResponse();
    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Password must have a minimum length of 4');
    });
  });

  it('should throw an error if password length is greater than maximum length', () => {
    const req: Request = authMockRequest({}, { username: 'manny', email: 'manny@test.com', password: 'mathematics1' }) as Request;
    const res: Response = authMockResponse();
    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Password should have a maximum length of 8');
    });
  });

  it('should throw unauthorize error if user already exist', () => {
    const req: Request = authMockRequest({}, { username: 'manny', email: 'manny@test.com', password: 'manny1' }) as Request;
    const res: Response = authMockResponse();
    const mockUser = {
      ...existingUser,
      comparePassword: () => true
    };
    jest.spyOn(mongoose.Query.prototype, 'exec').mockResolvedValueOnce(mockUser);

    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(401);
      expect(error.serializeErrors().message).toEqual('User with details already exists.');
    });
  });

  // fit('should send the success json response', async () => {
  //   // jest.setTimeout(10000);
  //   // jest.runOnlyPendingTimers();
  //   const req: Request = mockRequest({}, { username: 'manny', email: 'manny@test.com', password: 'manny1' }) as Request;
  //   const res: Response = mockResponse();
  //   jest.spyOn(mongoose.Query.prototype, 'exec').mockResolvedValue(null);
  //   // jest.spyOn(Promise, 'all');
  //   const image: Jimp = await new Jimp(256, 256, '#9c27b0');
  //   image.bitmap = {
  //     data: Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]),
  //     width: 256,
  //     height: 256
  //   };
  //   const font = await Jimp.loadFont(Jimp.FONT_SANS_128_WHITE);
  //   const mockImage = jest.spyOn(image, 'print');
  //   mockImage.mockImplementation((): any => image);
  //   // const mockBase64Image = jest.spyOn(image, 'getBase64Async');
  //   // mockBase64Image.mockImplementation((): any => image);
  //   // const dataFile: string = await image.getBase64Async('image/png');
  //   // console.log(dataFile);
  //   // const mockSignUpData = jest.spyOn(SignUpClass, 'signUpData');
  //   // // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   // mockSignUpData.mockImplementation((): any => existingUser);
  //   const saveToCache = saveUserToRedisCache(existingUser._id, existingUser.uId, existingUser as any);
  //   jest.spyOn(Promise, 'all').mockImplementationOnce(() => Promise.resolve([image, font]));
  //   // jest.spyOn(Promise, 'all').mockImplementationOnce(() => Promise.resolve([uploads(dataFile, existingUser._id, true, true), saveToCache]));
  //   // jest.spyOn(Promise, 'all');
  //   jest.spyOn(userQueue, 'addUserJob');
  //   await SignUp.prototype.create(req, res);
  //   console.log(req);
  // });
});

// npm test --verbose --runInBand --detectOpenHandles src/features/user/controllers/auth/test/signup.test.ts
