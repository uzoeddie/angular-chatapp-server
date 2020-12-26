import { Job } from 'bull';
import { saveFollowerToRedisCache, removeFollowerFromRedisCache } from '@redis/follower-cache';

class FollowerWorker {
    constructor() {}

    public async addFollowerToCache(jobQueue: Job<any>, done: any): Promise<void>{
        try {
            const { key, value } = jobQueue.data;
            await saveFollowerToRedisCache(key, value);
            jobQueue.progress(100);
            done(null, jobQueue.data);
        } catch (error) {
            done(error);
        }
    }
    
    public async removeFollowerFromCache(jobQueue: Job<any>, done: any): Promise<void>{
        try {
            const { key, value } = jobQueue.data;
            await removeFollowerFromRedisCache(key, value);
            jobQueue.progress(100);
            done(null, jobQueue.data);
        } catch (error) {
            done(error);
        }
    }
}

export const followerWorker: FollowerWorker = new FollowerWorker();