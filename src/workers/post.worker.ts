import { Job } from 'bull';
import { savePostsToRedisCache, updatePostInRedisCache, updateSinglePostPropInRedisCache } from '@redis/post-cache';
import { savePostCommentToRedisCache } from '@redis/comments-cache';
import { ServerSideError } from '@global/error-handler';

class PostWorker {
    constructor() {}

    public async savePostWorker(jobQueue: Job<any>, done: any): Promise<void>{
        try {
            const { key, uId, value } = jobQueue.data;
            await savePostsToRedisCache(key, uId, value);
            jobQueue.progress(100);
            done(null, jobQueue.data);
        } catch (error) {
            done(error);
        }
    }
    
    public async updatePostWorker(jobQueue: Job<any>, done: any): Promise<void>{
        try {
            const { key, value } = jobQueue.data;
            await updatePostInRedisCache(key, value);
            jobQueue.progress(100);
            done(null, jobQueue.data);
        } catch (error) {
            done(error);
            // throw new ServerSideError(error);
        }
    }
    
    public async updateSinglePostPropWorker(jobQueue: Job<any>, done: any): Promise<void>{
        try {
            const { key, value, type, username } = jobQueue.data;
            await updateSinglePostPropInRedisCache(key, type, value);
            if (username) {
                await savePostCommentToRedisCache(key, username);
            }
            jobQueue.progress(100);
            done(null, jobQueue.data);
        } catch (error) {
            done(error);
            // throw new ServerSideError(error.message);
        }
    }
}

export const postWorker: PostWorker = new PostWorker();
