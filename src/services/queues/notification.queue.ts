import Queue from 'bull';
import { BaseQueue } from '@queues/base.queue';
import { notificationWorker } from '@workers/notification.worker';
import { INotificationJobData } from '@notifications/interface/notification.interface';
class NotificationQueue extends BaseQueue {
  constructor() {
    super('notifications');
    this.processNotificationJob('updateNotification', 5, notificationWorker.updateNotification);
    this.processNotificationJob('deleteNotification', 5, notificationWorker.deleteNotification);
  }

  public addNotificationJob(name: string, data: INotificationJobData): void {
    this.addJob(name, data);
  }

  private processNotificationJob(name: string, concurrency: number, callback: Queue.ProcessCallbackFunction<void>): void {
    this.processJob(name, concurrency, callback);
  }
}

export const notificationQueue: NotificationQueue = new NotificationQueue();
