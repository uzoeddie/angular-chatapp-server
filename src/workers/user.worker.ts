import { DoneCallback, Job } from 'bull';
import { updateUserFollowersInRedisCache, updateBlockedUserPropInRedisCache } from '@redis/user-cache';
import { userService } from '@db/user.service';
import { updateSingleUserItemInRedisCache } from '@redis/user-info-cache';

class UserWorker {
  async updateUserFollowersInCache(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, prop, value } = jobQueue.data;
      await updateUserFollowersInRedisCache(key, prop, value);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error);
    }
  }

  async updateBlockedUserPropInCache(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, prop, value, type } = jobQueue.data;
      await updateBlockedUserPropInRedisCache(key, prop, value, type);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error);
    }
  }

  async updateNotificationPropInCache(jobQueue: Job, done: DoneCallback): Promise<void> {
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
      await userService.addUserDataToDB(jobQueue.data);
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
