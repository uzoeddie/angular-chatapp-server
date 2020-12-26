import Queue from 'bull';
import { postWorker } from '@workers/post.worker';
import { BaseQueue } from '@queues/base.queue';
import { userInfoWorker } from '@workers/user-info.worker';

class PostQueue extends BaseQueue {
    constructor() {
        super('posts');
        this.processPostJob('savePostsToRedisCache', 5, postWorker.savePostWorker);
        this.processPostJob('updatePostInRedisCache', 5, postWorker.updatePostWorker);
        this.processPostJob('updateSinglePostInRedis', 5, postWorker.updateSinglePostPropWorker);
        this.processPostJob('updateUserPostCount', 5, userInfoWorker.updateSinglePropInCache);
    }

    public addPostJob(name: string, data: any): void {
        this.addJob(name, data);
    }

    private processPostJob(name: string, concurrency: number, callback: Queue.ProcessCallbackFunction<any>): void {
        this.processJob(name, concurrency, callback);
    }
}

export const postQueue = new PostQueue();
