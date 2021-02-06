import { DoneCallback, Job } from 'bull';
import { commentService } from '@db/comment.service';
import { BaseWorker } from '@workers/base.worker';
class CommentWorker extends BaseWorker {
  async addCommentToDB(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      await commentService.addCommentToDB(jobQueue.data);
      this.progress(jobQueue, done);
    } catch (error) {
      done(error);
    }
  }
}

export const commentWorker: CommentWorker = new CommentWorker();
