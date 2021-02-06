import { DoneCallback, Job } from 'bull';
import { userService } from '@db/user.service';
import { updateSingleUserItemInRedisCache } from '@redis/user-info-cache';
import { blockUserService } from '@db/block-user.service';
import { BaseWorker } from '@workers/base.worker';
class UserWorker extends BaseWorker {
  async addBlockedUserToDB(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { keyOne, keyTwo } = jobQueue.data;
      await blockUserService.blockUser(keyOne, keyTwo);
      this.progress(jobQueue, done);
    } catch (error) {
      done(error);
    }
  }

  async removeUnblockedUserFromDB(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { keyOne, keyTwo } = jobQueue.data;
      await blockUserService.unblockUser(keyOne, keyTwo);
      this.progress(jobQueue, done);
    } catch (error) {
      done(error);
    }
  }

  async updateNotificationSettings(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = jobQueue.data;
      await userService.updateNotificationSettings(key, value);
      this.progress(jobQueue, done);
    } catch (error) {
      done(error);
    }
  }

  async addUserToDB(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { value } = jobQueue.data;
      await userService.addUserDataToDB(value);
      this.progress(jobQueue, done);
    } catch (error) {
      done(error);
    }
  }

  async updateSinglePropInCache(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, prop, value } = jobQueue.data;
      await updateSingleUserItemInRedisCache(key, prop, value);
      this.progress(jobQueue, done);
    } catch (error) {
      done(error);
    }
  }
}

export const userWorker: UserWorker = new UserWorker();
