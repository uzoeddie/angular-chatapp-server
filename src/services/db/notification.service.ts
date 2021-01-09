import { NotificationModel } from '@notifications/models/notification.schema';

class Notification {
  public async updateNotification(notificationId: string): Promise<void> {
    await NotificationModel.updateOne({ _id: notificationId }, { $set: { read: true } });
  }

  public async deleteNotification(notificationId: string): Promise<void> {
    await NotificationModel.deleteOne({ _id: notificationId });
  }
}

export const notificationService: Notification = new Notification();
