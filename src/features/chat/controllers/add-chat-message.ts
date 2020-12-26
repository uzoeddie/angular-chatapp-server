import { Request, Response } from "express";
import HTTP_STATUS from 'http-status-codes';
import mongoose from 'mongoose';
import { IMessageDocument } from "@chat/interface/chat.interface";
import { IConversationDocument } from "@chat/interface/converation.interface";
import { MessageModel } from "@chat/models/chat.schema";
import { ConversationModel } from "@chat/models/conversation.schema";
import { addChatSchema } from "@chat/schemes/chat";
import { joiValidation } from "@global/decorators/joi-validation.decorator";
import { chatQueue } from "@queues/chat.queue";
export class AddChat {
    @joiValidation(addChatSchema)
    public async message(req: Request, res: Response): Promise<void> {
        const { 
            receiverId, 
            receiverName, 
            body, 
            gifUrl,
            isRead,
            profilePicture,
            selectedImages
        }: { 
            receiverId: any, 
            receiverName: string, 
            body: string, 
            gifUrl: string, 
            isRead: boolean, 
            selectedImages: any,
            profilePicture: string,
        } = req.body;
        const createdAt = new Date();

        let conversation: IConversationDocument[] = await ConversationModel.aggregate([
            {
                $match: {
                    $or: [
                        { participants: { $elemMatch: { sender: mongoose.Types.ObjectId(req.currentUser?.userId), receiver: mongoose.Types.ObjectId(receiverId._id) }} },
                        { participants: { $elemMatch: { sender: mongoose.Types.ObjectId(receiverId._id), receiver: mongoose.Types.ObjectId(req.currentUser?.userId) }} }
                    ],
                }
            },
        ]);
        if (conversation.length === 0) {
            const newConversation: IConversationDocument = await ConversationModel.create(
                {
                    participants: [{
                        sender: mongoose.Types.ObjectId(req.currentUser?.userId),
                        receiver: mongoose.Types.ObjectId(receiverId._id)
                    }]
                }
            );
            conversation = [newConversation];
        }
        const data = {
            conversationId: `${conversation[0]._id}`,
            'senderId._id': req.currentUser?.userId,
            'senderId.username': req.currentUser?.username,
            'senderId.avatarColor': req.currentUser?.avatarColor,
            'senderId.email': req.currentUser?.email,
            'senderId.profilePicture': profilePicture,
            'receiverId._id': receiverId._id,
            'receiverId.username': receiverId.username,
            'receiverId.avatarColor': receiverId.avatarColor,
            'receiverId.email': receiverId.email,
            'receiverId.profilePicture': profilePicture,
            body: body,
            isRead: false,
            gifUrl,
            senderName: req.currentUser?.username,
            receiverName,
            createdAt: createdAt,
            images: selectedImages
        };
        const message: IMessageDocument = new MessageModel({
            conversationId: conversation[0]._id,
            senderId: req.currentUser?.userId,
            senderName: req.currentUser?.username,
            receiverId: receiverId._id,
            receiverName,
            body,
            gifUrl,
            isRead,
            images: selectedImages,
            createdAt
        });
        await message.save();
        const keys: string[] = [`${req.currentUser?.userId}`, `${receiverId._id}`];
        chatQueue.addChatJob('addChatMessagesToCache', { keys, key: `${conversation[0]._id}`, value: data });
        res.status(HTTP_STATUS.OK).json({ message: 'User added to chat list.', conversation: conversation[0]._id });
    }
}