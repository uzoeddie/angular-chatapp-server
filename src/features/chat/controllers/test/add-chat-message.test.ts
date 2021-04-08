import mongoose from 'mongoose';
import { Request, Response } from 'express';
import redis, { RedisClient } from 'redis-mock';
import { Server } from 'socket.io';
import { CustomError } from '@global/error-handler';
import { chatMessage, chatMockRequest, chatMockResponse } from '@mock/chat.mock';
import { AddChat } from '@chat/controllers/add-chat-message';
import { authUserPayload } from '@root/mocks/auth.mock';
import { socketIOChatObject } from '@sockets/chat';
import { chatQueue } from '@queues/chat.queue';

jest.useFakeTimers();
jest.mock('@sockets/users');
jest.mock('@redis/user-info-cache');
jest.mock('@queues/email.queue');

(socketIOChatObject as Server) = new Server();

describe('AddChat', () => {
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

  it('should throw an error if receiverName is not available', () => {
    const req: Request = chatMockRequest({}, { receiverName: '', receiverId: {} }) as Request;
    const res: Response = chatMockResponse();
    AddChat.prototype.message(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('"receiverName" is not allowed to be empty');
    });
  });

  it('should set session data for valid credentials and send correct json response', async () => {
    const req: Request = chatMockRequest({}, chatMessage, authUserPayload) as Request;
    const res: Response = chatMockResponse();
    jest.spyOn(socketIOChatObject, 'to');
    jest.spyOn(socketIOChatObject, 'emit');
    jest.spyOn(chatQueue, 'addChatJob');

    await AddChat.prototype.message(req, res);
    expect(socketIOChatObject.to).toHaveBeenCalled();
    expect(socketIOChatObject.emit).toHaveBeenCalled();
    expect(chatQueue.addChatJob).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Message added',
      conversation: mongoose.Types.ObjectId(`${chatMessage.conversationId}`)
    });
  });
});
