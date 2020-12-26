import Queue from 'bull';
import { setQueues } from 'bull-board';
import { config } from '@root/config';
import Logger from 'bunyan';

export abstract class BaseQueue {
    queue: Queue.Queue<any>;
    log: Logger;

    constructor(queueName: string) {
        this.queue = new Queue(queueName, `redis://${config.REDIS_HOST}:${config.REDIS_PORT}`);
        setQueues(this.queue);
        this.log = config.createLogger(`${queueName}Queue`);

        this.queue.on('completed', job => {
            job.remove();
        });
        
        this.queue.on('global:completed', (jobId, _result) => {
            this.log.info(`Job ${jobId} completed`);
        });
        
        this.queue.on('global:stalled', async (jobId, _result) => {
            this.log.info(`Job ${jobId} is stalled`);
        });
    }

    protected addJob(name: string, data: any): void {
        this.queue.add(name, data, { attempts: 3, backoff: { type: 'fixed', delay: 5000 }});
    }

    protected processJob(name: string, concurrency: number, callback: Queue.ProcessCallbackFunction<any>): void {
        this.queue.process(name, concurrency, callback);
    }
}