import { Job, DoneCallback } from 'bull';

export abstract class BaseWorker {
  protected progress(jobQueue: Job, done: DoneCallback): void {
    jobQueue.progress(100);
    done(null, jobQueue.data);
  }
}
