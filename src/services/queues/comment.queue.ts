import Queue from 'bull';
import { BaseQueue } from '@queues/base.queue';
import { commentWorker } from '@workers/comment.worker';
import { ICommentJob } from '@comments/interface/comment.interface';

class CommentQueue extends BaseQueue {
  constructor() {
    super('comments');
    this.processCommentJob('addCommentToDB', 5, commentWorker.addCommentToDB);
  }

  public addCommentJob(name: string, data: ICommentJob): void {
    this.addJob(name, data);
  }

  private processCommentJob(name: string, concurrency: number, callback: Queue.ProcessCallbackFunction<void>): void {
    this.processJob(name, concurrency, callback);
  }
}

export const commentQueue: CommentQueue = new CommentQueue();
