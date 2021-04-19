import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import mongoose from 'mongoose';
import { ObjectID } from 'mongodb';
import { unflatten } from 'flat';
import { IChatMessage, IChatConversationId, IChatRedisData, IMessageDocument } from '@chat/interface/chat.interface';
import { addChatSchema } from '@chat/schemes/chat';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { chatQueue } from '@queues/chat.queue';
import { messageCache } from '@redis/message-cache';
import { socketIOChatObject } from '@sockets/chat';
import { connectedUsersMap } from '@sockets/users';
import { notificationTemplate } from '@email/templates/notification/notification-template';
import { emailQueue } from '@queues/email.queue';
import { userCache } from '@redis/user-cache';
import { IUserDocument, AuthPayload } from '@user/interface/user.interface';

export class AddChat {
  @joiValidation(addChatSchema)
  public async message(req: Request, res: Response): Promise<void> {
    const { conversationId, receiverId, receiverName, body, gifUrl, isRead, selectedImages } = req.body;
    const createdAt = new Date();
    const messageObjectId: ObjectID = new ObjectID();
    let conversationObjectId: ObjectID;

    if (!conversationId) {
      conversationObjectId = new ObjectID();
    } else {
      conversationObjectId = mongoose.Types.ObjectId(conversationId);
    }
    const data: IChatRedisData = AddChat.prototype.flattenedRedisData(req, {
      _id: `${messageObjectId}`,
      conversationId: `${conversationObjectId}`,
      createdAt
    });
    // if chat has image, don't send
    if (!selectedImages.length) {
      AddChat.prototype.chatMessage(data);
    }

    const addChatList: Promise<void> = messageCache.addChatListToRedisCache([`${req.currentUser?.userId}`, `${receiverId._id}`], data);
    const addChatMessage: Promise<void> = messageCache.addChatmessageToRedisCache(`${conversationObjectId}`, data);
    await Promise.all([addChatList, addChatMessage]);

    const message: IMessageDocument = ({
      _id: messageObjectId,
      conversationId: conversationObjectId,
      senderId: mongoose.Types.ObjectId(req.currentUser?.userId),
      senderName: req.currentUser!.username,
      receiverId: mongoose.Types.ObjectId(receiverId._id),
      receiverName,
      body,
      gifUrl,
      isRead,
      images: selectedImages,
      createdAt
    } as unknown) as IMessageDocument;
    chatQueue.addChatJob('addChatMessagesToDB', { value: message });
    AddChat.prototype.messageNotification(req.currentUser!, body, receiverName, receiverId._id!);
    res.status(HTTP_STATUS.OK).json({ message: 'Message added', conversation: conversationObjectId });
  }

  private flattenedRedisData(req: Request, conversation: IChatConversationId): IChatRedisData {
    const { conversationId, _id, createdAt } = conversation;
    const { receiverId, receiverName, body, gifUrl, isRead, profilePicture, selectedImages } = req.body;
    return {
      _id,
      conversationId,
      'senderId._id': req.currentUser!.userId!,
      'senderId.username': req.currentUser!.username!,
      'senderId.avatarColor': req.currentUser!.avatarColor!,
      'senderId.email': req.currentUser!.email!,
      'senderId.profilePicture': profilePicture,
      'receiverId._id': receiverId._id!,
      'receiverId.username': receiverId.username!,
      'receiverId.avatarColor': receiverId.avatarColor!,
      'receiverId.email': receiverId.email!,
      'receiverId.profilePicture': profilePicture,
      body,
      isRead,
      gifUrl,
      senderName: req.currentUser!.username!,
      receiverName,
      createdAt: createdAt,
      images: selectedImages
    };
  }

  private chatMessage(data: IChatRedisData): void {
    const unflattenedMessageData: IChatMessage = unflatten(data);
    const senderSocketId: string = connectedUsersMap.get(unflattenedMessageData.senderId._id!) as string;
    const receiverSocketId: string = connectedUsersMap.get(unflattenedMessageData.receiverId._id!) as string;
    socketIOChatObject.to(senderSocketId).to(receiverSocketId).emit('message received', unflattenedMessageData);
    socketIOChatObject.to(senderSocketId).to(receiverSocketId).emit('chat list', unflattenedMessageData);
    socketIOChatObject.emit('trigger message notification', unflattenedMessageData);
  }

  private async messageNotification(currentUser: AuthPayload, message: string, receiverName: string, receiverId: string): Promise<void> {
    const cachedUser: IUserDocument = await userCache.getUserFromCache(`${receiverId}`);
    if (cachedUser.notifications.messages) {
      const templateParams = {
        username: receiverName,
        message,
        header: `Message Notification from ${currentUser.username}`
      };
      const template: string = notificationTemplate.notificationMessageTemplate(templateParams);
      emailQueue.addEmailJob('directMessageMail', {
        receiverEmail: currentUser.email,
        template,
        type: `You've received messages from ${receiverName}`
      });
    }
  }
}
