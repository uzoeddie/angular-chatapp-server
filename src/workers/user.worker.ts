import { DoneCallback, Job } from 'bull';
import { userService } from '@db/user.service';
import { updateSingleUserItemInRedisCache } from '@redis/user-info-cache';
import { blockUserService } from '@db/block-user.service';
class UserWorker {
  async addBlockedUserToDB(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { keyOne, keyTwo } = jobQueue.data;
      await blockUserService.blockUser(keyOne, keyTwo);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error);
    }
  }

  async removeUnblockedUserFromDB(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { keyOne, keyTwo } = jobQueue.data;
      await blockUserService.unblockUser(keyOne, keyTwo);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error);
    }
  }

  async updateNotificationSettings(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = jobQueue.data;
      await userService.updateNotificationSettings(key, value);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error);
    }
  }

  async addUserToDB(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { value } = jobQueue.data;
      await userService.addUserDataToDB(value);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error);
    }
  }

  async updateSinglePropInCache(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, prop, value } = jobQueue.data;
      await updateSingleUserItemInRedisCache(key, prop, value);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error);
    }
  }
}

export const userWorker: UserWorker = new UserWorker();
