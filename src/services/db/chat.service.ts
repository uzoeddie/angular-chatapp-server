import { IMessageDocument } from '@chat/interface/chat.interface';
import { IConversationDocument } from '@chat/interface/converation.interface';
import { MessageModel } from '@chat/models/chat.schema';
import { ConversationModel } from '@chat/models/conversation.schema';
import { ObjectID, ObjectId } from 'mongodb';

class Chat {
  public async addMessageToDB(data: IMessageDocument): Promise<void> {
    const conversation: IConversationDocument[] = await ConversationModel.aggregate([
      {
        $match: {
          $or: [
            {
              participants: {
                $elemMatch: {
                  sender: new ObjectId(data.senderId),
                  receiver: new ObjectId(data.receiverId)
                }
              }
            },
            {
              participants: {
                $elemMatch: {
                  sender: new ObjectId(data.receiverId),
                  receiver: new ObjectId(data.senderId)
                }
              }
            }
          ]
        }
      }
    ]);
    if (conversation.length === 0) {
      await ConversationModel.create({
        _id: data.conversationId,
        participants: [{ sender: data.senderId, receiver: data.receiverId }]
      });
    }
    const message: IMessageDocument = new MessageModel({
      _id: data._id,
      conversationId: data.conversationId,
      senderId: data.senderId,
      senderName: data.senderName,
      receiverId: data.receiverId,
      receiverName: data.receiverName,
      body: data.body,
      gifUrl: data.gifUrl,
      isRead: data.isRead,
      images: data.images,
      createdAt: data.createdAt
    });
    await message.save();
  }

  public async markMessageAsRead(conversationId: ObjectID): Promise<void> {
    await MessageModel.updateMany({ conversationId }, { $set: { isRead: true } });
  }
}

export const chatService: Chat = new Chat();
