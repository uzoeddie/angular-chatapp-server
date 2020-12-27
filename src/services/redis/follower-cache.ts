import redis, { RedisClient } from 'redis';
import Logger from 'bunyan';
import { config } from '@root/config';

const client: RedisClient = redis.createClient();
const log: Logger = config.createLogger('followersCache');

client.on('error', function (error) {
  log.error(error);
});

export function saveFollowerToRedisCache(key: string, value: string): Promise<void> {
  return new Promise((resolve, reject) => {
    client.lpush(`followers:${key}`, value, (error: Error | null) => {
      if (error) {
        reject(error);
      }
      resolve();
    });
  });
}

export function removeFollowerFromRedisCache(key: string, value: string): Promise<void> {
  return new Promise((resolve, reject) => {
    client.lrem(`followers:${key}`, 0, value, (error: Error | null) => {
      if (error) {
        reject(error);
      }
      resolve();
    });
  });
}

export function getFollowersFromRedisCache(key: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    client.lrange(`followers:${key}`, 0, -1, (err: Error | null, response: string[]) => {
      if (err) {
        reject(err);
      }
      resolve(response);
    });
  });
}

export { client as redisClient };
