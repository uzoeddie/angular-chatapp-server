import redis, { RedisClient } from 'redis';
import Logger from 'bunyan';
import { config } from '@root/config';
import { IRedisCommentList } from '@comments/interface/comment.interface';

const PORT: number = parseInt(config.REDIS_PORT!, 10) || 6379;
const client: RedisClient = redis.createClient({ host: config.REDIS_HOST! || 'localhost', port: PORT });
const log: Logger = config.createLogger('commentsCache');

client.on('error', function (error) {
  log.error(error);
});

export function savePostCommentToRedisCache(key: string, value: string): Promise<void> {
  return new Promise((resolve, reject) => {
    client.lpush(`comments:${key}`, value, (error: Error | null) => {
      if (error) {
        reject(error);
      }
      resolve();
    });
  });
}

export function getCommentsFromRedisCache(key: string): Promise<IRedisCommentList> {
  return new Promise((resolve, reject) => {
    client.llen(`comments:${key}`, (err: Error | null, reply: number) => {
      if (err) {
        reject(err);
      }
      const multi = client.multi();
      multi.lrange(`comments:${key}`, 0, -1);
      multi.exec((error, replies) => {
        if (error) {
          reject(error);
        }
        const response = {
          count: reply,
          names: replies[0]
        };
        resolve(response);
      });
    });
  });
}

export { client as redisClient };
