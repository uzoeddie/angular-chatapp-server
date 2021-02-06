import { DoneCallback, Job } from 'bull';
import { reactionService } from '@db/reaction.service';
import { BaseWorker } from '@workers/base.worker';
class ReactionWorker extends BaseWorker {
  async addReactionToDB(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      await reactionService.addReactionDataToDB(jobQueue.data);
      this.progress(jobQueue, done);
    } catch (error) {
      done(error);
    }
  }

  async removeReactionFromDB(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      await reactionService.removeReactionFromDB(jobQueue.data);
      this.progress(jobQueue, done);
    } catch (error) {
      done(error);
    }
  }
}

export const reactionWorker: ReactionWorker = new ReactionWorker();
