import { Job } from 'bull';
import { updateUserFollowersInRedisCache, updateBlockedUserPropInRedisCache, updateNotificationSettingInCache } from '@redis/user-cache';

class UserWorker {
    constructor() {}

    public async updateUserFollowersInCache(jobQueue: Job<any>, done: any): Promise<void>{
        try {
            const { key, prop, value } = jobQueue.data;
            await updateUserFollowersInRedisCache(key, prop, value);
            jobQueue.progress(100);
            done(null, jobQueue.data);
        } catch (error) {
            done(error);
        }
    }
    
    public async updateBlockedUserPropInCache(jobQueue: Job<any>, done: any): Promise<void>{
        try {
            const { key, prop, value, type } = jobQueue.data;
            await updateBlockedUserPropInRedisCache(key, prop, value, type);
            jobQueue.progress(100);
            done(null, jobQueue.data);
        } catch (error) {
            done(error);
        }
    }
    public async updateNotificationPropInCache(jobQueue: Job<any>, done: any): Promise<void>{
        try {
            const { key, prop, value } = jobQueue.data;
            await updateNotificationSettingInCache(key, prop, value);
            jobQueue.progress(100);
            done(null, jobQueue.data);
        } catch (error) {
            done(error);
        }
    }
}

export const userWorker: UserWorker = new UserWorker();