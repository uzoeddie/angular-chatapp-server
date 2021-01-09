import { DoneCallback, Job } from 'bull';
import { commentService } from '@db/comment.service';
class CommentWorker {
  async addCommentToDB(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      await commentService.addCommentToDB(jobQueue.data);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error);
    }
  }

  async addReactionToDB(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      await commentService.addReactionDataToDB(jobQueue.data);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error);
    }
  }

  async removeReactionFromDB(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      await commentService.removeReactionFromDB(jobQueue.data);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error);
    }
  }
}

export const commentWorker: CommentWorker = new CommentWorker();
