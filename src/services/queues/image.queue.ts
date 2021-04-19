import Queue from 'bull';
import { BaseQueue } from '@queues/base.queue';
import { imageWorker } from '@workers/image.worker';
import { IFileImageJobData } from '@images/interface/images.interface';
class ImageQueue extends BaseQueue {
  constructor() {
    super('images');
    this.processImageJob('updateImageInDB', 5, imageWorker.updateImageInDB);
    this.processImageJob('updateBGImageInDB', 5, imageWorker.updateBGImageInDB);
    this.processImageJob('removeImageFromDB', 5, imageWorker.removeImageFromDB);
  }

  public addImageJob(name: string, data: IFileImageJobData): void {
    this.addJob(name, data);
  }

  private processImageJob(name: string, concurrency: number, callback: Queue.ProcessCallbackFunction<void>): void {
    this.processJob(name, concurrency, callback);
  }
}

export const imageQueue: ImageQueue = new ImageQueue();
