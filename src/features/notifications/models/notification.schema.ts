import mongoose, { model, Model } from 'mongoose';
import { INotification, INotificationDocument } from '@notifications/interface/notification.interface';

const notificationSchema: mongoose.Schema = new mongoose.Schema({
  userTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  userFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  read: { type: Boolean, default: false },
  message: { type: String, default: '' },
  notificationType: String,
  entityId: mongoose.Schema.Types.ObjectId,
  createdItemId: mongoose.Schema.Types.ObjectId,
  date: { type: Date, default: Date.now() }
});

notificationSchema.methods.insertNotification = async function (body: INotification) {
  const { userTo, userFrom, message, notificationType, entityId, createdItemId } = body;
  await NotificationModel.create({
    userTo,
    userFrom,
    message,
    notificationType,
    entityId,
    createdItemId
  });
  return NotificationModel.find({ userTo })
    .lean()
    .populate({
      path: 'userFrom',
      select: 'username avatarColor uId profilePicture'
    })
    .sort({ date: -1 })
    .exec();
};

const NotificationModel: Model<INotificationDocument> = model<INotificationDocument>('Notification', notificationSchema, 'Notification');

export { NotificationModel };
