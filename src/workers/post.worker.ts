import { DoneCallback, Job } from 'bull';
import { postService } from '@db/post.service';
import { BaseWorker } from '@workers/base.worker';
class PostWorker extends BaseWorker {
  async savePostWorker(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = jobQueue.data;
      await postService.addPostToDB(key, value);
      this.progress(jobQueue, done);
    } catch (error) {
      done(error);
    }
  }

  async updatePostWorker(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = jobQueue.data;
      await postService.editPost(key, value);
      this.progress(jobQueue, done);
    } catch (error) {
      done(error);
    }
  }

  async deletePostWorker(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { keyOne, keyTwo } = jobQueue.data;
      await postService.deletePost(keyOne, keyTwo);
      this.progress(jobQueue, done);
    } catch (error) {
      done(error);
    }
  }
}

export const postWorker: PostWorker = new PostWorker();
