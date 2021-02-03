/* eslint-disable @typescript-eslint/no-explicit-any */
import Queue from 'bull';
import { chatWorker } from '@workers/chat.worker';
import { BaseQueue } from '@queues/base.queue';
// import { IChatJobData } from '@chat/interface/chat.interface';

class ChatQueue extends BaseQueue {
  constructor() {
    super('chat');
    this.processChatJob('addChatMessagesToDB', 5, chatWorker.addChatMessagesToDB);
    this.processChatJob('markMessagesAsReadInDB', 5, chatWorker.markMessagesAsReadInDB);
  }

  public addChatJob(name: string, data: any): void {
    this.addJob(name, data);
  }

  private processChatJob(name: string, concurrency: number, callback: Queue.ProcessCallbackFunction<any>): void {
    this.processJob(name, concurrency, callback);
  }
}

export const chatQueue: ChatQueue = new ChatQueue();
