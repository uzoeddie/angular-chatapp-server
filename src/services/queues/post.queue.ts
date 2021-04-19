import Queue from 'bull';
import { postWorker } from '@workers/post.worker';
import { BaseQueue } from '@queues/base.queue';
import { IPostJobData } from '@posts/interface/post.interface';
class PostQueue extends BaseQueue {
  constructor() {
    super('posts');
    this.processPostJob('savePostsToDB', 5, postWorker.savePostWorker);
    this.processPostJob('updatePostInRedisCache', 5, postWorker.updatePostWorker);
    this.processPostJob('deletePostFromDB', 5, postWorker.deletePostWorker);
  }

  public addPostJob(name: string, data: IPostJobData): void {
    this.addJob(name, data);
  }

  private processPostJob(name: string, concurrency: number, callback: Queue.ProcessCallbackFunction<void>): void {
    this.processJob(name, concurrency, callback);
  }
}

export const postQueue: PostQueue = new PostQueue();
