import Queue from 'bull';
import { followerWorker } from '@workers/follower.worker';
import { BaseQueue } from '@queues/base.queue';
import { IFollowerJobData } from '@followers/interface/followers.interface';

class FollowerQueue extends BaseQueue {
  constructor() {
    super('followers');
    this.processFollowerJob('addFollowerDB', 5, followerWorker.addFollowerToDB);
    this.processFollowerJob('removeFollowerFromDB', 5, followerWorker.removeFollowerFromDB);
  }

  public addFollowerJob(name: string, data: IFollowerJobData): void {
    this.addJob(name, data);
  }

  private processFollowerJob(name: string, concurrency: number, callback: Queue.ProcessCallbackFunction<void>): void {
    this.processJob(name, concurrency, callback);
  }
}

export const followerQueue: FollowerQueue = new FollowerQueue();
