import Queue from 'bull';
import { followerWorker } from '@workers/follower.worker';
import { BaseQueue } from '@queues/base.queue';

class FollowerQueue extends BaseQueue {
    constructor() {
        super('followers');
        this.processFollowerJob('addFollowerToCache', 5, followerWorker.addFollowerToCache);
        this.processFollowerJob('removeFollowerFromCache', 5, followerWorker.removeFollowerFromCache);
    }

    public addFollowerJob(name: string, data: any): void {
        this.addJob(name, data);
    }

    private processFollowerJob(name: string, concurrency: number, callback: Queue.ProcessCallbackFunction<any>): void {
        this.processJob(name, concurrency, callback);
    }
}

export const followerQueue = new FollowerQueue();
