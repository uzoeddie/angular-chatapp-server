import { BaseQueue } from '@queues/base.queue';
import { emailWorker } from '@workers/email.worker';
import { IEmailJob } from '@user/interface/user.interface';
class EmailQueue extends BaseQueue {
  constructor() {
    super('email');
    this.processJob('forgotPasswordMail', 5, emailWorker.addPasswordMail);
    this.processJob('resetPasswordConfirmation', 5, emailWorker.addPasswordMail);
    this.processJob('changePassword', 5, emailWorker.addPasswordMail);
    this.processJob('commentsMail', 5, emailWorker.addNotificationMail);
    this.processJob('reactionsMail', 5, emailWorker.addNotificationMail);
    this.processJob('directMessageMail', 5, emailWorker.addNotificationMail);
    this.processJob('followersMail', 5, emailWorker.addNotificationMail);
  }

  public addEmailJob(name: string, data: IEmailJob): void {
    this.addJob(name, data);
  }
}

export const emailQueue: EmailQueue = new EmailQueue();
