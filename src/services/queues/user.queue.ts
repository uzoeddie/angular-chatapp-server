/* eslint-disable @typescript-eslint/no-explicit-any */
import Queue from 'bull';
import { userWorker } from '@workers/user.worker';
import { BaseQueue } from '@queues/base.queue';
import { IUserJob } from '@user/interface/user.interface';

class UserQueue extends BaseQueue {
  constructor() {
    super('users');
    this.processUserJob('updateUserFollowersInCache', 5, userWorker.updateUserFollowersInCache);
    this.processUserJob('updateBlockedUserPropInCache', 5, userWorker.updateBlockedUserPropInCache);
    this.processUserJob('updateNotificationPropInCache', 5, userWorker.updateNotificationPropInCache);
  }

  public addUserJob(name: string, data: IUserJob): void {
    this.addJob(name, data);
  }

  private processUserJob(name: string, concurrency: number, callback: Queue.ProcessCallbackFunction<any>): void {
    this.processJob(name, concurrency, callback);
  }
}

export const userQueue = new UserQueue();
