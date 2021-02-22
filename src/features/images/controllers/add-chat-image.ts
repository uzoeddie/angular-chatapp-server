import { Request, Response } from 'express';
import { AddChat } from '@chat/controllers/add-chat-message';
import { uploads } from '@global/cloudinary-upload';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { UploadApiResponse } from 'cloudinary';
import { addChatSchema } from '@chat/schemes/chat';
import { socketIOChatObject } from '@sockets/chat';
import { connectedUsersMap } from '@sockets/users';
import { IChatMessage } from '@chat/interface/chat.interface';

export class AddMessage {
  @joiValidation(addChatSchema)
  public async image(req: Request, res: Response): Promise<void> {
    const { selectedImages } = req.body;
    const chatData: IChatMessage = {
      senderId: {
        _id: req.currentUser?.userId,
        username: req.currentUser?.username,
        email: req.currentUser?.email,
        avatarColor: req.currentUser?.avatarColor,
        profilePicture: req.body.profilePicture
      },
      conversationId: req.body.conversationId,
      receiverId: req.body.receiverId,
      senderName: req.currentUser!.username,
      body: req.body.body,
      isRead: req.body.isRead,
      createdAt: req.body.createdAt,
      gifUrl: req.body.gifUrl,
      images: [...selectedImages]
    };
    const senderSocketId: string = connectedUsersMap.get(req.currentUser!.userId) as string;
    const receiverSocketId: string = connectedUsersMap.get(req.body.receiverId._id!) as string;
    socketIOChatObject.to(senderSocketId).to(receiverSocketId).emit('message received', chatData);

    let uploadResult: string[] = [];

    for (const file of selectedImages) {
      const result: UploadApiResponse = (await uploads(file)) as UploadApiResponse;
      const url = `http://res.cloudinary.com/ratingapp/image/upload/v${result.version}/${result.public_id}`;
      uploadResult = [...uploadResult, url];
    }
    if (uploadResult.length === selectedImages.length) {
      req.body.selectedImages = uploadResult;
      await AddChat.prototype.message(req, res);
    }
  }
}
