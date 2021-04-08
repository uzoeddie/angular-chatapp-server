/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { GetUser } from '@user/controllers/user/get-profile';
import * as cache from '@redis/user-cache';
import * as postCache from '@redis/post-cache';
import { authMockRequest, authMockResponse } from '@mock/auth.mock';
import { existingUser } from '@mock/user.mock';
import { postMockData } from '@mock/post.mock';
import { followerData } from '@mock/followers.mock';

jest.useFakeTimers();

describe('GetUser', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  afterAll((done) => {
    done();
  });

  describe('all', () => {
    it('should send the success json response', async () => {
      const req: Request = authMockRequest({}, {}, null, { page: '1' }) as Request;
      const res: Response = authMockResponse();
      jest.spyOn(cache, 'getUsersFromCache').mockImplementation((): any => [existingUser]);
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
      jest.spyOn(cache, 'getUserFromCache').mockImplementation((): any => existingUser);
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
      jest.spyOn(cache, 'getUserFromCache').mockImplementation((): any => existingUser);
      jest.spyOn(postCache, 'getUserPostsFromCache').mockImplementation((): any => [postMockData]);
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
