/* eslint-disable @typescript-eslint/no-explicit-any */
import Queue from 'bull';
import { BaseQueue } from '@queues/base.queue';
import { imageWorker } from '@workers/image.worker';

class ImageQueue extends BaseQueue {
  constructor() {
    super('images');
    this.processImageJob('updateImageInDB', 5, imageWorker.updateImageInDB);
    this.processImageJob('updateBGImageInDB', 5, imageWorker.updateBGImageInDB);
    this.processImageJob('removeImageFromDB', 5, imageWorker.removeImageFromDB);
  }

  public addImageJob(name: string, data: any): void {
    this.addJob(name, data);
  }

  private processImageJob(name: string, concurrency: number, callback: Queue.ProcessCallbackFunction<any>): void {
    this.processJob(name, concurrency, callback);
  }
}

export const imageQueue: ImageQueue = new ImageQueue();
