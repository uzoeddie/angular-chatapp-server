import Queue from 'bull';
import { BaseQueue } from '@queues/base.queue';
import { reactionWorker } from '@workers/reaction.worker';
import { IReactionJob } from '@comments/interface/comment.interface';

class ReactionQueue extends BaseQueue {
  constructor() {
    super('reactions');
    this.processReactionJob('addReactionToDB', 5, reactionWorker.addReactionToDB);
    this.processReactionJob('removeReactionFromDB', 5, reactionWorker.removeReactionFromDB);
  }

  public addReactionJob(name: string, data: IReactionJob): void {
    this.addJob(name, data);
  }

  private processReactionJob(name: string, concurrency: number, callback: Queue.ProcessCallbackFunction<void>): void {
    this.processJob(name, concurrency, callback);
  }
}

export const reactionQueue: ReactionQueue = new ReactionQueue();
