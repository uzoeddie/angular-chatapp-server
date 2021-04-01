/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import redis, { RedisClient } from 'redis-mock';
import { chatMockRequest, chatMockResponse, conversationParticipants } from '@mock/chat.mock';
import { authUserPayload } from '@root/mocks/auth.mock';
import * as cache from '@redis/message-cache';
import { ConversationModel } from '@chat/models/conversation.schema';
import { MarkChat } from '@chat/controllers/mark-chat-message';
import { socketIOChatObject } from '@sockets/chat';
import { Server } from 'socket.io';
import { existingUser } from '@mock/user.mock';
import { chatQueue } from '@queues/chat.queue';

jest.useFakeTimers();
jest.mock('@sockets/users');
jest.mock('@redis/message-cache');
jest.mock('@global/helpers');

(socketIOChatObject as Server) = new Server();

describe('MarkChat', () => {
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

  describe('message', () => {
    it('should send correct json response if conversationId is empty', async () => {
      const req: Request = chatMockRequest(
        {},
        {
          conversationId: '',
          receiverId: '6064793b091bf02b6a71067a',
          userId: existingUser._id
        },
        authUserPayload
      ) as Request;
      const res: Response = chatMockResponse();
      jest.spyOn(cache, 'updateIsReadPropInRedisCache').mockImplementation((): any => JSON.stringify('testing'));
      jest.spyOn(ConversationModel, 'aggregate').mockResolvedValueOnce(conversationParticipants);
      jest.spyOn(socketIOChatObject, 'emit');
      jest.spyOn(chatQueue, 'addChatJob');

      await MarkChat.prototype.message(req, res);
      expect(socketIOChatObject.emit).toHaveBeenCalled();
      expect(chatQueue.addChatJob).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Message marked as read',
        notification: false
      });
    });

    it('should send correct json response if conversationId is not empty', async () => {
      const req: Request = chatMockRequest(
        {},
        {
          conversationId: '6064799e091bf02b6a71067f',
          receiverId: '6064793b091bf02b6a71067a',
          userId: existingUser._id
        },
        authUserPayload
      ) as Request;
      const res: Response = chatMockResponse();
      jest.spyOn(cache, 'updateIsReadPropInRedisCache').mockImplementation((): any => JSON.stringify('testing'));
      jest.spyOn(socketIOChatObject, 'emit');
      jest.spyOn(chatQueue, 'addChatJob');

      await MarkChat.prototype.message(req, res);
      expect(socketIOChatObject.emit).toHaveBeenCalled();
      expect(chatQueue.addChatJob).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Message marked as read',
        notification: false
      });
    });
  });
});
