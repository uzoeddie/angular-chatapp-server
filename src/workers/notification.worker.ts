import { DoneCallback, Job } from 'bull';
import { notificationService } from '@db/notification.service';
import { BaseWorker } from '@workers/base.worker';
class NotificationWorker extends BaseWorker {
  async updateNotification(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { key } = jobQueue.data;
      await notificationService.updateNotification(key);
      this.progress(jobQueue, done);
    } catch (error) {
      done(error);
    }
  }

  async deleteNotification(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { key } = jobQueue.data;
      await notificationService.deleteNotification(key);
      this.progress(jobQueue, done);
    } catch (error) {
      done(error);
    }
  }
}

export const notificationWorker: NotificationWorker = new NotificationWorker();
