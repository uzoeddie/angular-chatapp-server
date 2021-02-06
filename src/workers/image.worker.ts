import { DoneCallback, Job } from 'bull';
import { imageService } from '@db/image.service';
import { BaseWorker } from '@workers/base.worker';
class ImageWorker extends BaseWorker {
  async updateImageInDB(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = jobQueue.data;
      await imageService.addImageToDB(key, value);
      this.progress(jobQueue, done);
    } catch (error) {
      done(error);
    }
  }

  async updateBGImageInDB(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, imgId, imgVersion } = jobQueue.data;
      await imageService.addBackgroundImageToDB(key, imgId, imgVersion);
      this.progress(jobQueue, done);
    } catch (error) {
      done(error);
    }
  }

  async removeImageFromDB(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { userId, imageId } = jobQueue.data;
      await imageService.removeImageFromDB(userId, imageId);
      this.progress(jobQueue, done);
    } catch (error) {
      done(error);
    }
  }
}

export const imageWorker: ImageWorker = new ImageWorker();
