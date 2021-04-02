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
// import Jimp from 'jimp';

jest.useFakeTimers();
// jest.setTimeout(10000);
// jest.mock('@global/cloudinary-upload');
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

  // describe('create', () => {
  //   // beforeEach(() => {
  //   //   jest.mock('jimp');
  //   // });

  //   // jest.mock('jimp');

  //   it('should send the success json response', async () => {
  //     // jest.mock('jimp', () => {
  //     //   console.log('testing');
  //     //   return new Jimp(256, 256, '#9c27b0', (err, image) => {
  //     //     // this image is 1280 x 768, pixels are loaded from the given buffer.
  //     //     return image;
  //     //   });
  //     // });
  //     const req: Request = authMockRequest({}, { username: 'manny', email: 'manny@test.com', password: 'manny1' }) as Request;
  //     const res: Response = authMockResponse();
  //     jest.spyOn(mongoose.Query.prototype, 'exec').mockResolvedValue(null);
  //     const image = new Jimp(256, 256, '#9c27b0');
  //     Object.defineProperty(image, 'bitmap', {
  //       value: {
  //         data: Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]),
  //         width: 256,
  //         height: 256
  //       },
  //       writable: true,
  //       enumerable: true,
  //       configurable: true
  //     });
  //     console.log(image.bitmap);
  //     // const image: Jimp = new Jimp(256, 256, '#9c27b0');
  //     // // jest.setTimeout(10000);
  //     // console.log(image.bitmap);
  //     // image.bitmap = {
  //     //   data: Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]),
  //     //   width: 256,
  //     //   height: 256
  //     // };
  //     // const font = Jimp.loadFont(Jimp.FONT_SANS_128_WHITE);
  //     // jest.spyOn(image, 'print');
  //     // const saveToCache = saveUserToRedisCache(existingUser._id, existingUser.uId, existingUser as any);
  //     // console.log('first bitmap', image.bitmap);
  //     // jest.spyOn(Promise, 'all').mockImplementationOnce(() => Promise.resolve([image, font]));
  //     // await Promise.all([image, font]);
  //     // jest.spyOn(Promise, 'all').mockImplementationOnce(() => Promise.resolve([uploads(dataFile, existingUser._id, true, true), saveToCache]));
  //     // jest.spyOn(Promise, 'all');
  //     // jest.spyOn(userQueue, 'addUserJob');
  //     SignUp.prototype
  //       .create(req, res)
  //       .then(() => {
  //         console.log(req);
  //       })
  //       .catch((error) => console.log(error));
  //   });
  // });
});
