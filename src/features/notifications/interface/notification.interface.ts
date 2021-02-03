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

  insertNotification(data: INotification): Promise<void>;
}

export interface INotification {
  userFrom: string;
  userTo: string;
  message: string;
  notificationType: string;
  entityId: string;
  createdItemId: mongoose.Types.ObjectId | string;
}
