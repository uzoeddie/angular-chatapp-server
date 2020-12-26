import mongoose from 'mongoose';

export interface INotificationDocument extends mongoose.Document {
    _id: mongoose.Types.ObjectId;
    userTo: string;
    userFrom: string;
    message: string;
    notificationType: string;
    entityId: mongoose.Types.ObjectId;
    createdItemId: mongoose.Types.ObjectId;
    read?: boolean;
    date?: Date;

    insertNotification(data: any): Promise<void>;
};

export interface INotification {
    senderId: string;
    message: string;
    read?: boolean;
    date?: Date;
    _id?: mongoose.Types.ObjectId;
}
