import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import mongoose from 'mongoose';
import { IChatMessage, IChatRedisData, IChatUser, IMessageDocument } from '@chat/interface/chat.interface';
import { addChatSchema } from '@chat/schemes/chat';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { chatQueue } from '@queues/chat.queue';
import { ObjectID } from 'mongodb';
import { addChatListToRedisCache, addChatmessageToRedisCache } from '@redis/message-cache';
import { unflatten } from 'flat';
import { socketIOChatObject } from '@sockets/chat';
import { connectedUsersMap } from '@sockets/users';
import { notificationTemplate } from '@email/templates/notification/notification-template';
import { emailQueue } from '@queues/email.queue';
import { getUserFromCache } from '@redis/user-cache';
import { IUserDocument, AuthPayload } from '@user/interface/user.interface';

export class AddChat {
  @joiValidation(addChatSchema)
  public async message(req: Request, res: Response): Promise<void> {
    const {
      conversationId,
      receiverId,
      receiverName,
      body,
      gifUrl,
      isRead,
      profilePicture,
      selectedImages
    }: {
      conversationId: string;
      receiverId: IChatUser;
      receiverName: string;
      body: string;
      gifUrl: string;
      isRead: boolean;
      selectedImages: string[];
      profilePicture: string;
    } = req.body;
    const createdAt = new Date();
    let conversationObjectId: ObjectID;

    if (!conversationId) {
      conversationObjectId = new ObjectID();
    } else {
      conversationObjectId = mongoose.Types.ObjectId(conversationId);
    }
    const messageObjectId: ObjectID = new ObjectID();

    const data: IChatRedisData = {
      _id: `${messageObjectId}`,
      conversationId: `${conversationObjectId}`,
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
    // if chat has image, don't send
    if (!selectedImages.length) {
      chatMessage(data);
    }

    const addChatList: Promise<void> = addChatListToRedisCache([`${req.currentUser?.userId}`, `${receiverId._id}`], data);
    const addChatMessage: Promise<void> = addChatmessageToRedisCache(`${conversationObjectId}`, data);
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
    messageNotification(req.currentUser!, body, receiverName, receiverId._id!);
    res.status(HTTP_STATUS.OK).json({ message: 'Message added', conversation: conversationObjectId });
  }
}

function chatMessage(data: IChatRedisData): void {
  const unflattenedMessageData: IChatMessage = unflatten(data);
  const senderSocketId: string = connectedUsersMap.get(unflattenedMessageData.senderId._id!) as string;
  const receiverSocketId: string = connectedUsersMap.get(unflattenedMessageData.receiverId._id!) as string;
  socketIOChatObject.to(senderSocketId).to(receiverSocketId).emit('message received', unflattenedMessageData);
  socketIOChatObject.to(senderSocketId).to(receiverSocketId).emit('chat list', unflattenedMessageData);
  socketIOChatObject.emit('trigger message notification', unflattenedMessageData);
}

async function messageNotification(currentUser: AuthPayload, message: string, receiverName: string, receiverId: string): Promise<void> {
  const cachedUser: IUserDocument = await getUserFromCache(`${receiverId}`);
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
