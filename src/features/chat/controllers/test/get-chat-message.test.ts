/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import { Request, Response } from 'express';
import redis, { RedisClient } from 'redis-mock';
import {
  cachedList,
  cachedMessage,
  chatMessage,
  chatMockRequest,
  chatMockResponse,
  conversationParticipants,
  flattenedChatList,
  parsedChatMessage
} from '@mock/chat.mock';
import { authUserPayload } from '@root/mocks/auth.mock';
import { GetChat } from '@chat/controllers/get-chat-message';
import * as cache from '@redis/message-cache';
import { Helpers } from '@global/helpers';
import { ConversationModel } from '@chat/models/conversation.schema';

jest.mock('@redis/message-cache');
jest.mock('@global/helpers');

describe('GetChat', () => {
  let client: RedisClient;
  beforeEach(() => {
    jest.restoreAllMocks();
    client = redis.createClient({ host: '127.0.0.1', port: 6379 });
  });

  afterEach((done) => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    client.flushall(done);
    client.quit(done);
  });

  afterAll((done) => {
    mongoose.connection.close();
    done();
  });

  describe('list', () => {
    it('should send correct json response if chat list exist in redis', async () => {
      const req: Request = chatMockRequest({}, chatMessage, authUserPayload) as Request;
      const res: Response = chatMockResponse();
      jest.spyOn(cache, 'getChatFromRedisCache').mockImplementation((): any => cachedList);

      await GetChat.prototype.list(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User chat list.',
        list: flattenedChatList
      });
    });

    it('should send correct json response if no chat list response from redis', async () => {
      const req: Request = chatMockRequest({}, chatMessage, authUserPayload) as Request;
      const res: Response = chatMockResponse();
      jest.spyOn(cache, 'getChatFromRedisCache').mockImplementation((): any => []);
      jest.spyOn(Helpers, 'getMessages').mockImplementation(() => Promise.resolve(flattenedChatList));

      await GetChat.prototype.list(req, res);
      expect(Helpers.getMessages).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User chat list.',
        list: flattenedChatList
      });
    });

    it('should send correct json response with empty chat list if it does not exist (redis & database)', async () => {
      const req: Request = chatMockRequest({}, chatMessage, authUserPayload) as Request;
      const res: Response = chatMockResponse();
      jest.spyOn(cache, 'getChatFromRedisCache').mockImplementation((): any => []);
      jest.spyOn(Helpers, 'getMessages').mockImplementation(() => Promise.resolve([]));

      await GetChat.prototype.list(req, res);
      expect(Helpers.getMessages).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User chat list.',
        list: []
      });
    });
  });

  describe('messages', () => {
    it('should send correct json response if conversationId is not undefined and messages exist in redis', async () => {
      const req: Request = chatMockRequest({}, chatMessage, authUserPayload, {
        conversationId: '6064799e091bf02b6a71067f',
        receiverId: '6064793b091bf02b6a71067a'
      }) as Request;
      const res: Response = chatMockResponse();
      jest.spyOn(cache, 'getChatFromRedisCache').mockImplementation((): any => cachedMessage);

      await GetChat.prototype.messages(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User chat messages.',
        chat: parsedChatMessage
      });
    });

    it('should send correct json response if conversationId is not undefined and messages does not exist in redis', async () => {
      const req: Request = chatMockRequest({}, chatMessage, authUserPayload, {
        conversationId: '6064799e091bf02b6a71067f',
        receiverId: '6064793b091bf02b6a71067a'
      }) as Request;
      const res: Response = chatMockResponse();
      jest.spyOn(cache, 'getChatFromRedisCache').mockImplementation((): any => []);
      jest.spyOn(Helpers, 'getMessages').mockImplementation(() => Promise.resolve(parsedChatMessage));

      await GetChat.prototype.messages(req, res);
      expect(Helpers.getMessages).toHaveBeenCalledWith(
        { conversationId: mongoose.Types.ObjectId('6064799e091bf02b6a71067f') },
        { createdAt: 1 }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User chat messages.',
        chat: parsedChatMessage
      });
    });

    it('should send correct json response if conversationId is undefined', async () => {
      const req: Request = chatMockRequest({}, chatMessage, authUserPayload, {
        conversationId: 'undefined',
        receiverId: '6064793b091bf02b6a71067a'
      }) as Request;
      const res: Response = chatMockResponse();
      jest.spyOn(ConversationModel, 'aggregate').mockResolvedValueOnce(conversationParticipants);
      jest.spyOn(Helpers, 'getMessages').mockImplementation(() => Promise.resolve(parsedChatMessage));

      await GetChat.prototype.messages(req, res);
      expect(Helpers.getMessages).toHaveBeenCalledWith(
        { conversationId: mongoose.Types.ObjectId(conversationParticipants[0]._id) },
        { createdAt: 1 }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User chat messages.',
        chat: parsedChatMessage
      });
    });

    it('should send correct json response if conversationId is undefined and no conversation in the database', async () => {
      const req: Request = chatMockRequest({}, chatMessage, authUserPayload, {
        conversationId: 'undefined',
        receiverId: '6064793b091bf02b6a71067a'
      }) as Request;
      const res: Response = chatMockResponse();
      jest.spyOn(ConversationModel, 'aggregate').mockResolvedValueOnce([]);

      await GetChat.prototype.messages(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User chat messages.',
        chat: []
      });
    });
  });
});
