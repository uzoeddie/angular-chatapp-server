import { Request, Response } from "express";
import HTTP_STATUS from 'http-status-codes';
import mongoose from 'mongoose';
import { MessageModel } from "@chat/models/chat.schema";
import { markChatSchema } from "@chat/schemes/chat";
import { joiValidation } from "@global/decorators/joi-validation.decorator";
import { chatQueue } from "@queues/chat.queue";
import { IConversationDocument } from "@chat/interface/converation.interface";
import { ConversationModel } from "@chat/models/conversation.schema";
export class MarkChat {
  @joiValidation(markChatSchema)
  public async message(req: Request, res: Response): Promise<void> {
    let conversationMessageId;
    const { conversationId, receiverId, userId }: { conversationId: string, receiverId: string, userId: string } = req.body;
    if (!conversationId) {
      let conversation: IConversationDocument[] = await ConversationModel.aggregate([
        {
          $match: {
            $or: [
              { participants: { $elemMatch: { sender: mongoose.Types.ObjectId(userId), receiver: mongoose.Types.ObjectId(receiverId) }} },
              { participants: { $elemMatch: { sender: mongoose.Types.ObjectId(receiverId), receiver: mongoose.Types.ObjectId(userId) }} }
            ],
          }
        },
      ]);
      conversationMessageId = conversation[0]._id;
    } else {
      conversationMessageId = conversationId;
    }
    await MessageModel.updateMany({ conversationId: conversationMessageId }, { $set: { isRead : true } });
    chatQueue.addChatJob('markMessagesAsReadInCache', { keyOne: `${req.currentUser?.userId}`, keyTwo: `${receiverId}`, conversationId: `${conversationMessageId}` });
    res.status(HTTP_STATUS.OK).json({});
  }
}