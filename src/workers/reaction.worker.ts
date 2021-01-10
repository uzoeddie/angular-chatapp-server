import { DoneCallback, Job } from 'bull';
import { reactionService } from '@db/reaction.service';

class ReactionWorker {
  async addReactionToDB(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      await reactionService.addReactionDataToDB(jobQueue.data);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error);
    }
  }

  async removeReactionFromDB(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      await reactionService.removeReactionFromDB(jobQueue.data);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error);
    }
  }
}

export const reactionWorker: ReactionWorker = new ReactionWorker();
