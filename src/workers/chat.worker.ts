import { DoneCallback, Job } from 'bull';
import { addChatListToRedisCache, addChatmessageToRedisCache, updateIsReadPropInRedisCache } from '@redis/message-cache';

class ChatWorker {
  async addChatMessagesToCache(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { keys, key, value } = jobQueue.data;
      const addChatList: Promise<void> = addChatListToRedisCache(keys, value);
      const addChatMessage: Promise<void> = addChatmessageToRedisCache(key, value);
      await Promise.all([addChatList, addChatMessage]);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error);
    }
  }

  async markMessagesAsReadInRedisCache(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { keyOne, keyTwo, conversationId } = jobQueue.data;
      await updateIsReadPropInRedisCache(keyOne, keyTwo, conversationId);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error);
    }
  }
}

export const chatWorker: ChatWorker = new ChatWorker();
