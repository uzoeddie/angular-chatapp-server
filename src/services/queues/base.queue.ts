import Queue, { Job } from 'bull';
import { BullAdapter, setQueues } from 'bull-board';
import { config } from '@root/config';
import Logger from 'bunyan';
import { IChatJobData } from '@chat/interface/chat.interface';
import { IFollowerJobData } from '@followers/interface/followers.interface';
import { IPostJobData } from '@posts/interface/post.interface';
import { IEmailJob, IUserJob, IUserJobInfo } from '@user/interface/user.interface';

type IBaseJobData = IChatJobData | IFollowerJobData | IPostJobData | IUserJobInfo | IUserJob | IEmailJob;
const REDIS_PORT = 6379;
export abstract class BaseQueue {
  queue: Queue.Queue;
  log: Logger;

  constructor(queueName: string) {
    this.queue = new Queue(queueName, `redis://${config.REDIS_HOST}:${REDIS_PORT}`);
    setQueues([new BullAdapter(this.queue)]);
    this.log = config.createLogger(`${queueName}Queue`);

    this.queue.on('completed', (job: Job) => {
      job.remove();
    });

    this.queue.on('global:completed', (jobId: string) => {
      this.log.info(`Job ${jobId} completed`);
    });

    this.queue.on('global:stalled', async (jobId: string) => {
      this.log.info(`Job ${jobId} is stalled`);
    });
  }

  protected addJob(name: string, data: IBaseJobData): void {
    this.queue.add(name, data, { attempts: 3, backoff: { type: 'fixed', delay: 5000 } });
  }

  protected processJob(name: string, concurrency: number, callback: Queue.ProcessCallbackFunction<void>): void {
    this.queue.process(name, concurrency, callback);
  }
}
