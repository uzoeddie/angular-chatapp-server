import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import mongoose, { Aggregate } from 'mongoose';
import { unflatten } from 'flat';
import { markChatSchema } from '@chat/schemes/chat';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { chatQueue } from '@queues/chat.queue';
import { IConversationDocument } from '@chat/interface/converation.interface';
import { ConversationModel } from '@chat/models/conversation.schema';
import { messageCache } from '@redis/message-cache';
import { socketIOChatObject } from '@sockets/chat';

export class MarkChat {
  @joiValidation(markChatSchema)
  public async message(req: Request, res: Response): Promise<void> {
    let conversationMessageId: mongoose.Types.ObjectId;
    const { conversationId, receiverId, userId }: { conversationId: string; receiverId: string; userId: string } = req.body;
    if (!conversationId) {
      const conversation: IConversationDocument[] = await MarkChat.prototype.conversationAggregate(userId, receiverId);
      conversationMessageId = conversation[0]._id;
    } else {
      conversationMessageId = mongoose.Types.ObjectId(conversationId);
    }
    const response: string = await messageCache.updateIsReadPropInRedisCache(
      `${req.currentUser?.userId}`,
      `${receiverId}`,
      `${conversationMessageId}`
    );
    socketIOChatObject.emit('message collection update', unflatten(JSON.parse(response)));
    chatQueue.addChatJob('markMessagesAsReadInDB', { conversationId: conversationMessageId });
    res.status(HTTP_STATUS.OK).json({ message: 'Message marked as read', notification: false });
  }

  private async conversationAggregate(userId: string, receiverId: string): Promise<IConversationDocument[]> {
    return new Promise((resolve) => {
      const conversation: Aggregate<IConversationDocument[]> = ConversationModel.aggregate([
        {
          $match: {
            $or: [
              {
                participants: {
                  $elemMatch: { sender: mongoose.Types.ObjectId(userId), receiver: mongoose.Types.ObjectId(receiverId) }
                }
              },
              {
                participants: {
                  $elemMatch: { sender: mongoose.Types.ObjectId(receiverId), receiver: mongoose.Types.ObjectId(userId) }
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
