import { followerWorker } from '@workers/follower.worker';
import { BaseQueue } from '@queues/base.queue';
import { IFollowerJobData } from '@followers/interface/followers.interface';
class FollowerQueue extends BaseQueue {
  constructor() {
    super('followers');
    this.processJob('addFollowerDB', 5, followerWorker.addFollowerToDB);
    this.processJob('removeFollowerFromDB', 5, followerWorker.removeFollowerFromDB);
  }

  public addFollowerJob(name: string, data: IFollowerJobData): void {
    this.addJob(name, data);
  }
}

export const followerQueue: FollowerQueue = new FollowerQueue();
