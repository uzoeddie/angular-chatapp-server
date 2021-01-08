/* eslint-disable @typescript-eslint/no-explicit-any */
import Queue from 'bull';
import { userWorker } from '@workers/user.worker';
import { BaseQueue } from '@queues/base.queue';
import { userInfoWorker } from '@workers/user-info.worker';
// import { IUserJob } from '@user/interface/user.interface';

class UserQueue extends BaseQueue {
  constructor() {
    super('users');
    this.processUserJob('addUserToDB', 5, userWorker.addUserToDB);
    this.processUserJob('updateUserFollowersInCache', 5, userWorker.updateUserFollowersInCache);
    this.processUserJob('updateBlockedUserPropInCache', 5, userWorker.updateBlockedUserPropInCache);
    this.processUserJob('updateNotificationPropInCache', 5, userWorker.updateNotificationPropInCache);
    this.processUserJob('updateImageInCache', 5, userInfoWorker.updateSinglePropInCache); // will work on this later
  }

  // public addUserJob(name: string, data: IUserJob): void {
  public addUserJob(name: string, data: any): void {
    this.addJob(name, data);
  }

  private processUserJob(name: string, concurrency: number, callback: Queue.ProcessCallbackFunction<any>): void {
    this.processJob(name, concurrency, callback);
  }
}

export const userQueue = new UserQueue();
