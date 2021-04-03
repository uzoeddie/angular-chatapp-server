import { DoneCallback, Job } from 'bull';
import { mailTransport } from '@email/mail-transport';

class EmailWorker {
  async addPasswordMail(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { template, receiverEmail, type } = jobQueue.data;
      await mailTransport.sendEmail(receiverEmail, type, template);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error);
    }
  }

  async addNotificationMail(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { template, receiverEmail, type } = jobQueue.data;
      await mailTransport.sendEmail(receiverEmail, type, template);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error);
    }
  }
}

export const emailWorker: EmailWorker = new EmailWorker();
