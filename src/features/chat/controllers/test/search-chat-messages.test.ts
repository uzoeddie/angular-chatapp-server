/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import redis, { RedisClient } from 'redis-mock';
import { chatMockRequest, chatMockResponse, searchResult } from '@mock/chat.mock';
import { authUserPayload } from '@root/mocks/auth.mock';
import { Search } from '@chat/controllers/search-chat-user';
import { UserModel } from '@user/models/user.schema';

jest.useFakeTimers();

describe('Search', () => {
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

  afterAll((done) => {
    done();
  });

  describe('users', () => {
    it('should send correct json response if searched user exist', async () => {
      const req: Request = chatMockRequest({}, {}, authUserPayload, { query: 'Danny' }) as Request;
      const res: Response = chatMockResponse();
      jest.spyOn(UserModel, 'aggregate').mockResolvedValueOnce(searchResult);

      await Search.prototype.users(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Search results',
        search: searchResult
      });
    });

    it('should send correct json response if searched user does not exist', async () => {
      const req: Request = chatMockRequest({}, {}, authUserPayload, { query: 'DannyBoy' }) as Request;
      const res: Response = chatMockResponse();
      jest.spyOn(UserModel, 'aggregate').mockResolvedValueOnce([]);

      await Search.prototype.users(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Search results',
        search: []
      });
    });
  });
});
