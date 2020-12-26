import redis, { RedisClient } from 'redis';
import Logger from 'bunyan';
import { config } from '@root/config';
import { IRedisCommentList } from '@comments/interface/comment.interface';

const client: RedisClient = redis.createClient();
const log: Logger = config.createLogger('commentsCache');

client.on('error', function(error) {
    log.error(error);
});

export function savePostCommentToRedisCache(key: any, value: string): Promise<void> {
    return new Promise((resolve, reject) => {
        client.lpush(`comments:${key}`, value, (error) => {
            if (error) {
                reject(error);
            }
            resolve();
        });
    });
}

export function getCommentsFromRedisCache(key: string): Promise<IRedisCommentList> {
    return new Promise<any>((resolve, reject) => {
        client.llen(`comments:${key}`, (err, reply) => {
            if (err)  { reject(err) };
            const multi = client.multi();
            multi.lrange(`comments:${key}`, 0, -1);
            multi.exec((error, replies) => {
                if (error)  { reject(error) };
                const response = {
                    count: reply,
                    names: replies[0]
                }
                resolve(response);
            });
        });
    })
}

export { client as redisClient };