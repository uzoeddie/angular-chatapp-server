import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import mongoose, { Aggregate } from 'mongoose';
import { ObjectId } from 'mongodb';
import { unflatten } from 'flat';
import { messageCache } from '@redis/message-cache';
import { IConversationDocument } from '@chat/interface/converation.interface';
import { ConversationModel } from '@chat/models/conversation.schema';
import { Helpers } from '@global/helpers';
import { IChatMessage } from '@chat/interface/chat.interface';

export class GetChat {
  public async list(req: Request, res: Response): Promise<void> {
    let list: IChatMessage[];
    const cachedList: string[] = await messageCache.getChatFromRedisCache(`chatList:${req.currentUser?.userId}`);
    if (cachedList.length) {
      list = GetChat.prototype.unflattenList(cachedList);
    } else {
      const senderId: ObjectId = mongoose.Types.ObjectId(req.currentUser?.userId);
      list = await Helpers.getMessages({ $or: [{ senderId }, { receiverId: senderId }] }, { createdAt: 1 });
    }
    res.status(HTTP_STATUS.OK).json({ message: 'User chat list.', list });
  }

  public async messages(req: Request, res: Response): Promise<void> {
    const { conversationId, receiverId } = req.params;
    let messages: IChatMessage[] = [];
    if (conversationId !== 'undefined') {
      const cachedMessages: string[] = await messageCache.getChatFromRedisCache(`messages:${conversationId}`);
      messages = cachedMessages.length
        ? GetChat.prototype.unflattenList(cachedMessages)
        : await Helpers.getMessages({ conversationId: mongoose.Types.ObjectId(conversationId) }, { createdAt: 1 });
    } else {
      const conversation: IConversationDocument[] = await GetChat.prototype.conversationAggregate(req.currentUser!.userId, receiverId);
      if (conversation.length) {
        messages = await Helpers.getMessages({ conversationId: conversation[0]._id }, { createdAt: 1 });
      }
    }
    res.status(HTTP_STATUS.OK).json({ message: 'User chat messages.', chat: messages });
  }

  private unflattenList(cachedList: string[]): IChatMessage[] {
    const flattenedList = [];
    for (const item of cachedList) {
      flattenedList.push(unflatten(JSON.parse(item)));
    }
    return flattenedList;
  }

  private async conversationAggregate(userId: string, receiverId: string): Promise<IConversationDocument[]> {
    return new Promise((resolve) => {
      const conversation: Aggregate<IConversationDocument[]> = ConversationModel.aggregate([
        {
          $match: {
            $or: [
              {
                participants: {
                  $elemMatch: {
                    sender: mongoose.Types.ObjectId(userId),
                    receiver: mongoose.Types.ObjectId(receiverId)
                  }
                }
              },
              {
                participants: {
                  $elemMatch: {
                    sender: mongoose.Types.ObjectId(receiverId),
                    receiver: mongoose.Types.ObjectId(userId)
                  }
                }
              }
            ]
          }
        }
      ]);
      resolve(conversation);
    });
  }
}
