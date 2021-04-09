/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import redis, { RedisClient } from 'redis-mock';
import { Server } from 'socket.io';
import { authUserPayload } from '@root/mocks/auth.mock';
import { AddMessage } from '@images/controllers/add-chat-image';
import { socketIOChatObject } from '@sockets/chat';
import { imagesMockRequest, imagesMockResponse } from '@mock/image.mock';
import { AddChat } from '@chat/controllers/add-chat-message';
import * as cloudinaryUploads from '@global/cloudinary-upload';

jest.useFakeTimers();
jest.mock('@sockets/users');
jest.mock('@sockets/chat');
jest.mock('@global/cloudinary-upload');

(socketIOChatObject as Server) = new Server();

describe('AddMessage', () => {
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
    done();
  });

  it('should call the upload and message methods', async () => {
    const req: Request = imagesMockRequest(
      {},
      {
        selectedImages: ['this is a string'],
        receiverId: {
          avatarColor: '#9c27b0',
          email: 'manny@me.com',
          profilePicture: '',
          username: 'Manny',
          _id: '60263f14648fed5246e322d9'
        },
        receiverName: 'Manny'
      },
      authUserPayload
    ) as Request;
    const res: Response = imagesMockResponse();
    jest.spyOn(socketIOChatObject, 'to');
    jest.spyOn(socketIOChatObject, 'emit');
    jest.spyOn(AddChat.prototype, 'message');
    jest.spyOn(cloudinaryUploads, 'uploads').mockImplementation((): any => Promise.resolve({ version: '1234', public_id: '123456' }));

    await AddMessage.prototype.image(req, res);
    expect(socketIOChatObject.to).toHaveBeenCalled();
    expect(socketIOChatObject.emit).toHaveBeenCalled();
    expect(cloudinaryUploads.uploads).toHaveBeenCalled();
    expect(AddChat.prototype.message).toHaveBeenCalled();
  });
});
