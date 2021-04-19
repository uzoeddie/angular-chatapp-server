import { chatWorker } from '@workers/chat.worker';
import { BaseQueue } from '@queues/base.queue';
import { IChatJobData } from '@chat/interface/chat.interface';
class ChatQueue extends BaseQueue {
  constructor() {
    super('chat');
    this.processJob('addChatMessagesToDB', 5, chatWorker.addChatMessagesToDB);
    this.processJob('markMessagesAsReadInDB', 5, chatWorker.markMessagesAsReadInDB);
  }

  public addChatJob(name: string, data: IChatJobData): void {
    this.addJob(name, data);
  }
}

export const chatQueue: ChatQueue = new ChatQueue();
