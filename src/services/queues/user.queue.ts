/* eslint-disable @typescript-eslint/no-explicit-any */
import Queue from 'bull';
import { userWorker } from '@workers/user.worker';
import { BaseQueue } from '@queues/base.queue';
// import { IUserJob } from '@user/interface/user.interface';

class UserQueue extends BaseQueue {
  constructor() {
    super('users');
    this.processUserJob('addUserToDB', 5, userWorker.addUserToDB);
    this.processUserJob('addBlockedUserToDB', 5, userWorker.addBlockedUserToDB);
    this.processUserJob('removeUnblockedUserFromDB', 5, userWorker.removeUnblockedUserFromDB);
    this.processUserJob('updateNotificationSettings', 5, userWorker.updateNotificationSettings);
  }

  // public addUserJob(name: string, data: IUserJob): void {
  public addUserJob(name: string, data: any): void {
    this.addJob(name, data);
  }

  private processUserJob(name: string, concurrency: number, callback: Queue.ProcessCallbackFunction<any>): void {
    this.processJob(name, concurrency, callback);
  }
}

export const userQueue: UserQueue = new UserQueue();
