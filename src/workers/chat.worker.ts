import { DoneCallback, Job } from 'bull';
import { chatService } from '@db/chat.service';
import { BaseWorker } from '@workers/base.worker';
class ChatWorker extends BaseWorker {
  async addChatMessagesToDB(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { value } = jobQueue.data;
      await chatService.addMessageToDB(value);
      this.progress(jobQueue, done);
    } catch (error) {
      done(error);
    }
  }

  async markMessagesAsReadInDB(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { conversationId } = jobQueue.data;
      await chatService.markMessageAsRead(conversationId);
      this.progress(jobQueue, done);
    } catch (error) {
      done(error);
    }
  }
}

export const chatWorker: ChatWorker = new ChatWorker();
