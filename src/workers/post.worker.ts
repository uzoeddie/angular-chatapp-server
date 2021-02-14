import { DoneCallback, Job } from 'bull';
import { postService } from '@db/post.service';
class PostWorker {
  async savePostWorker(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = jobQueue.data;
      await postService.addPostToDB(key, value);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error);
    }
  }

  async updatePostWorker(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = jobQueue.data;
      await postService.editPost(key, value);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error);
    }
  }

  async deletePostWorker(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { keyOne, keyTwo } = jobQueue.data;
      await postService.deletePost(keyOne, keyTwo);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error);
    }
  }
}

export const postWorker: PostWorker = new PostWorker();
