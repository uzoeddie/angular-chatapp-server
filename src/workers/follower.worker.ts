import { DoneCallback, Job } from 'bull';
import { saveFollowerToRedisCache, removeFollowerFromRedisCache } from '@redis/follower-cache';

class FollowerWorker {
  async addFollowerToCache(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = jobQueue.data;
      await saveFollowerToRedisCache(key, value);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error);
    }
  }

  async removeFollowerFromCache(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = jobQueue.data;
      await removeFollowerFromRedisCache(key, value);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error);
    }
  }
}

export const followerWorker: FollowerWorker = new FollowerWorker();
