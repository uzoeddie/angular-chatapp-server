import { postWorker } from '@workers/post.worker';
import { BaseQueue } from '@queues/base.queue';
import { IPostJobData } from '@posts/interface/post.interface';
class PostQueue extends BaseQueue {
  constructor() {
    super('posts');
    this.processJob('savePostsToDB', 5, postWorker.savePostWorker);
    this.processJob('updatePostInRedisCache', 5, postWorker.updatePostWorker);
    this.processJob('deletePostFromDB', 5, postWorker.deletePostWorker);
  }

  public addPostJob(name: string, data: IPostJobData): void {
    this.addJob(name, data);
  }
}

export const postQueue: PostQueue = new PostQueue();
