import { DoneCallback, Job } from 'bull';
import { updateUserFollowersInRedisCache, updateBlockedUserPropInRedisCache, updateNotificationSettingInCache } from '@redis/user-cache';

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
      const { key, prop, value } = jobQueue.data;
      await updateNotificationSettingInCache(key, prop, value);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error);
    }
  }
}

export const userWorker: UserWorker = new UserWorker();
