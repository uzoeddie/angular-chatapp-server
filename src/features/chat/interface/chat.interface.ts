import mongoose from 'mongoose';

export interface IMessageDocument extends mongoose.Document {
    _id: mongoose.Types.ObjectId;
    conversationId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    receiverId: mongoose.Types.ObjectId;
    senderName: string;
    receiverName: string;
    body: string;
    gifUrl: string;
    isRead: boolean;
    images: string[];
    createdAt: Date;
}

export interface ITyping {
    sender: string;
    receiver: string;
}
  
export interface IChatPage {
    name: string;
    url: string;
    type?: string;
}

export interface IChatUser {
    _id?: string;
    username?: string;
    email?: string;
    profilePicture?: string;
    avatarColor?: string;
    senderName?: string;
    conversationId?: string;
    body?: string;
    createdAt?: Date;
    isRead?: boolean;
}

export interface IChatMessage {
    body: string;
    isRead: boolean;
    images: string[];
    conversationId: string;
    senderName: string;
    gifUrl: string;
    createdAt: Date;
    senderId: IChatUser;
    receiverId: IChatUser;
}