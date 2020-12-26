import mongoose from 'mongoose';
import { INotificationDocument } from '@notifications/interface/notification.interface';

const notificationSchema: mongoose.Schema = new mongoose.Schema({
    userTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    userFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    read: { type: Boolean, default: false },
    message: { type: String, default: '' },
    notificationType: String,
    entityId: mongoose.Schema.Types.ObjectId,
    createdItemId: mongoose.Schema.Types.ObjectId,
    date: { type: Date, default: Date.now() },   
});

notificationSchema.methods.insertNotification = async (body: any) => {
    const { userTo, userFrom, message, notificationType, entityId, createdItemId } = body;
    await NotificationModel.create(
        { 
            userTo,
            userFrom,
            message,
            notificationType ,
            entityId,
            createdItemId
        }, 
    );
}

const NotificationModel: mongoose.Model<INotificationDocument> = mongoose.model<INotificationDocument>('Notification', notificationSchema, 'Notification');

export { NotificationModel };
