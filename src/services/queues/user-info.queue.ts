import Queue from 'bull';
import { userInfoWorker } from '@workers/user-info.worker';
import { BaseQueue } from '@queues/base.queue';

class UserInfoQueue extends BaseQueue {
    constructor() {
        super('usersInfo');
        this.processUserInfoJob('updateUserWorkInCache', 5, userInfoWorker.updateUserPropListInCache);
        this.processUserInfoJob('updateUserSchoolInCache', 5, userInfoWorker.updateUserPropListInCache);
        this.processUserInfoJob('updateUserPlaceInCache', 5, userInfoWorker.updateUserPropListInCache);
        this.processUserInfoJob('updateBasicInfoInCache', 5, userInfoWorker.updateSinglePropInCache);
        this.processUserInfoJob('updateImageInCache', 5, userInfoWorker.updateSinglePropInCache);
        this.processUserInfoJob('updateBirthdayInCache', 5, userInfoWorker.updateSinglePropInCache);
        this.processUserInfoJob('updateAboutInfoInCache', 5, userInfoWorker.updateSinglePropInCache);
        this.processUserInfoJob('updateQuotesInCache', 5, userInfoWorker.updateSinglePropInCache);
    }

    public addUserInfoJob(name: string, data: any): void {
        this.addJob(name, data);
    }

    private processUserInfoJob(name: string, concurrency: number, callback: Queue.ProcessCallbackFunction<any>): void {
        this.processJob(name, concurrency, callback);
    }
}

export const userInfoQueue = new UserInfoQueue();
