import { ProcessCallbackFunction } from 'bull';
import { BaseQueue } from '@queues/base.queue';
import { emailWorker } from '@workers/email.worker';
import { IEmailJob } from '@user/interface/user.interface';

class EmailQueue extends BaseQueue {
  constructor() {
    super('email');
    this.processEmailJob('forgotPasswordMail', 5, emailWorker.addPasswordMail);
    this.processEmailJob('resetPasswordConfirmation', 5, emailWorker.addPasswordMail);
    this.processEmailJob('changePassword', 5, emailWorker.addPasswordMail);
    this.processEmailJob('commentsMail', 5, emailWorker.addNotificationMail);
    this.processEmailJob('reactionsMail', 5, emailWorker.addNotificationMail);
    this.processEmailJob('directMessageMail', 5, emailWorker.addNotificationMail);
    this.processEmailJob('followersMail', 5, emailWorker.addNotificationMail);
  }

  public addEmailJob(name: string, data: IEmailJob): void {
    this.addJob(name, data);
  }

  private processEmailJob(name: string, concurrency: number, callback: ProcessCallbackFunction<void>): void {
    this.processJob(name, concurrency, callback);
  }
}

export const emailQueue: EmailQueue = new EmailQueue();
