import { DoneCallback, Job } from 'bull';
import { followerService } from '@db/follower.service';
import { BaseWorker } from '@workers/base.worker';
class FollowerWorker extends BaseWorker {
  async addFollowerToDB(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { keyOne, keyTwo, username, followerDocumentId } = jobQueue.data;
      await followerService.addFollowerToDB(keyOne, keyTwo, username, followerDocumentId);
      this.progress(jobQueue, done);
    } catch (error) {
      done(error);
    }
  }

  async removeFollowerFromDB(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { keyOne, keyTwo } = jobQueue.data;
      await followerService.unfollowerFromDB(keyOne, keyTwo);
      this.progress(jobQueue, done);
    } catch (error) {
      done(error);
    }
  }
}

export const followerWorker: FollowerWorker = new FollowerWorker();
