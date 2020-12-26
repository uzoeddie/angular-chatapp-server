import { Request, Response } from "express";
import HTTP_STATUS from 'http-status-codes';
import mongoose from 'mongoose';
import { getChatFromRedisCache } from "@redis/message-cache";
import { IConversationDocument } from "@chat/interface/converation.interface";
import { ConversationModel } from "@chat/models/conversation.schema";
import { Helpers } from "@global/helpers";
import { IChatMessage } from "@chat/interface/chat.interface";
import { ObjectId } from "mongodb";

const unflatten = require('flat').unflatten;
export class GetChat {
    public async list(req: Request, res: Response): Promise<void> {
        let list: IChatMessage[];
        const cachedList: string[] = await getChatFromRedisCache(`chatList:${req.currentUser?.userId}`);
        if (cachedList.length) {
            const flattenedList = [];
            for (const item of cachedList) {
                flattenedList.push(unflatten(JSON.parse(item)));
            }
            list = flattenedList;
            res.status(HTTP_STATUS.OK).json({ message: 'User chat list.', list });
            return;
        }
        const senderId: ObjectId = mongoose.Types.ObjectId(req.currentUser?.userId);
        list = await Helpers.getMessages({ $or: [ { senderId }, { receiverId: senderId }]}, { createdAt : 1 });
        res.status(HTTP_STATUS.OK).json({ message: 'User chat list.', list });
    }

    public async messages(req: Request, res: Response): Promise<void> {
        const { conversationId, receiverId } = req.params;
        let messages = [];
        if (conversationId !== 'undefined') {
            const cachedMessages = await getChatFromRedisCache(`messages:${conversationId}`);
            if (cachedMessages.length) {
                const parsedItem = [];
                for (const item of cachedMessages) {
                    parsedItem.push(unflatten(JSON.parse(item)));
                }
                messages = parsedItem;
            } else {
                messages = await Helpers.getMessages({ conversationId: mongoose.Types.ObjectId(conversationId) }, { createdAt : 1 });
            }
        } else {
            let conversation: IConversationDocument[] = await ConversationModel.aggregate([
                {
                  $match: {
                    $or: [
                      { participants: { $elemMatch: { sender: mongoose.Types.ObjectId(req.currentUser?.userId), receiver: mongoose.Types.ObjectId(receiverId) }} },
                      { participants: { $elemMatch: { sender: mongoose.Types.ObjectId(receiverId), receiver: mongoose.Types.ObjectId(req.currentUser?.userId) }} }
                    ],
                  }
                },
            ]);
            if (conversation.length) {
                messages = await Helpers.getMessages({ conversationId: conversation[0]._id }, { createdAt : 1 });
            }
        }
        res.status(HTTP_STATUS.OK).json({ message: 'User chat messages.', chat: messages });
    }
}