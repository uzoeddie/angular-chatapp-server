import { userWorker } from '@workers/user.worker';
import { BaseQueue } from '@queues/base.queue';
import { IUserJob } from '@user/interface/user.interface';
class UserQueue extends BaseQueue {
  constructor() {
    super('users');
    this.processJob('addUserToDB', 5, userWorker.addUserToDB);
    this.processJob('addBlockedUserToDB', 5, userWorker.addBlockedUserToDB);
    this.processJob('removeUnblockedUserFromDB', 5, userWorker.removeUnblockedUserFromDB);
    this.processJob('updateNotificationSettings', 5, userWorker.updateNotificationSettings);
  }

  public addUserJob(name: string, data: IUserJob): void {
    this.addJob(name, data);
  }
}

export const userQueue: UserQueue = new UserQueue();
