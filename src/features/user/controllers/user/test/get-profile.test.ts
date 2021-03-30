import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { GetUser } from '@user/controllers/user/get-profile';
import { IUserDocument } from '@user/interface/user.interface';
import * as cache from '@redis/user-cache';
import * as postCache from '@redis/post-cache';
import { IPostDocument } from '@posts/interface/post.interface';
import { authMockRequest, authMockResponse } from '@mock/auth.mock';
import { existingUser, followerData } from '@mock/user.mock';
import { postMockData } from '@mock/post.mock';

jest.useFakeTimers();

describe('GetUser', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('all', () => {
    it('should send the success json response', async () => {
      const req: Request = authMockRequest({}, {}, null, { page: '1' }) as Request;
      const res: Response = authMockResponse();
      const mock: jest.SpyInstance<Promise<IUserDocument[]>> = jest.spyOn(cache, 'getUsersFromCache');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mock.mockImplementation((): any => [existingUser]);
      jest.spyOn(mongoose.Query.prototype, 'exec').mockResolvedValueOnce([followerData]);
      await GetUser.prototype.all(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get users',
        users: [existingUser],
        followers: [followerData]
      });
    });
  });

  describe('profile', () => {
    it('should send the success json response', async () => {
      const req: Request = authMockRequest({}, {}, null) as Request;
      const res: Response = authMockResponse();
      const mock: jest.SpyInstance<Promise<IUserDocument>> = jest.spyOn(cache, 'getUserFromCache');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mock.mockImplementation((): any => existingUser);
      await GetUser.prototype.profile(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get user profile',
        user: existingUser
      });
    });
  });

  describe('username', () => {
    it('should send the success json response', async () => {
      const req: Request = authMockRequest({}, {}, null, { username: 'manny' }) as Request;
      const res: Response = authMockResponse();
      const mock: jest.SpyInstance<Promise<IUserDocument>> = jest.spyOn(cache, 'getUserFromCache');
      const mockPost: jest.SpyInstance<Promise<IPostDocument[]>> = jest.spyOn(postCache, 'getUserPostsFromCache');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mock.mockImplementation((): any => existingUser);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockPost.mockImplementation((): any => [postMockData]);
      await GetUser.prototype.username(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get user profile by username',
        user: existingUser,
        posts: [postMockData]
      });
    });
  });
});
