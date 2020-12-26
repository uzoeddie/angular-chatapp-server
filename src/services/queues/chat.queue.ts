import Queue from 'bull';
import { chatWorker } from '@workers/chat.worker';
import { BaseQueue } from '@queues/base.queue';

class ChatQueue extends BaseQueue {
    constructor() {
        super('chat');
        this.processChatJob('addChatMessagesToCache', 5, chatWorker.addChatMessagesToCache);
        this.processChatJob('markMessagesAsReadInCache', 5, chatWorker.markMessagesAsReadInRedisCache);
    }

    public addChatJob(name: string, data: any): void {
        this.addJob(name, data);
    }

    private processChatJob(name: string, concurrency: number, callback: Queue.ProcessCallbackFunction<any>): void {
        this.processJob(name, concurrency, callback);
    }
}

export const chatQueue = new ChatQueue();
