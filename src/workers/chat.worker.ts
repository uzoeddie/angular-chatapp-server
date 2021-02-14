import { DoneCallback, Job } from 'bull';
import { chatService } from '@db/chat.service';
class ChatWorker {
  async addChatMessagesToDB(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { value } = jobQueue.data;
      await chatService.addMessageToDB(value);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error);
    }
  }

  async markMessagesAsReadInDB(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { conversationId } = jobQueue.data;
      await chatService.markMessageAsRead(conversationId);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error);
    }
  }
}

export const chatWorker: ChatWorker = new ChatWorker();
