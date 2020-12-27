import { DoneCallback, Job } from 'bull';
import { savePostsToRedisCache, updatePostInRedisCache, updateSinglePostPropInRedisCache } from '@redis/post-cache';
import { savePostCommentToRedisCache } from '@redis/comments-cache';

class PostWorker {
  async savePostWorker(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, uId, value } = jobQueue.data;
      await savePostsToRedisCache(key, uId, value);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error);
    }
  }

  async updatePostWorker(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = jobQueue.data;
      await updatePostInRedisCache(key, value);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error);
    }
  }

  async updateSinglePostPropWorker(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value, type, username } = jobQueue.data;
      await updateSinglePostPropInRedisCache(key, type, value);
      if (username) {
        await savePostCommentToRedisCache(key, username);
      }
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error);
    }
  }
}

export const postWorker: PostWorker = new PostWorker();
