import Queue from 'bull';
import { userWorker } from '@workers/user.worker';
import { BaseQueue } from '@queues/base.queue';

class UserQueue extends BaseQueue {
    constructor() {
        super('users');
        this.processUserJob('updateUserFollowersInCache', 5, userWorker.updateUserFollowersInCache);
        this.processUserJob('updateBlockedUserPropInCache', 5, userWorker.updateBlockedUserPropInCache);
        this.processUserJob('updateNotificationPropInCache', 5, userWorker.updateNotificationPropInCache);
    }

    public addUserJob(name: string, data: any): void {
        this.addJob(name, data);
    }

    private processUserJob(name: string, concurrency: number, callback: Queue.ProcessCallbackFunction<any>): void {
        this.processJob(name, concurrency, callback);
    }
}

export const userQueue = new UserQueue();
