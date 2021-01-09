import redis, { Multi, RedisClient } from 'redis';
import Logger from 'bunyan';
import { config } from '@root/config';
import { IFollower } from '@followers/interface/followers.interface';
import { Helpers } from '@global/helpers';
import _ from 'lodash';

const PORT: number = parseInt(config.REDIS_PORT!, 10) || 6379;
const client: RedisClient = redis.createClient({ host: config.REDIS_HOST! || 'localhost', port: PORT });
const log: Logger = config.createLogger('followersCache');

client.on('error', function (error) {
  log.error(error);
});

export function saveFollowerToRedisCache(key: string, value: IFollower): Promise<void> {
  return new Promise((resolve, reject) => {
    client.lpush(key, JSON.stringify(value), (error: Error | null) => {
      if (error) {
        reject(error);
      }
      resolve();
    });
  });
}

export function removeFollowerFromRedisCache(key: string, value: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const multi: Multi = client.multi();
    client.lrange(key, 0, -1, (error: Error | null, response: string[]) => {
      if (error) {
        reject(error);
      }
      const list: IFollower[] = [];
      for (const value of response) {
        list.push(Helpers.parseJson(value));
      }
      const result: IFollower = _.find(list, (item: IFollower) => item._id === value) as IFollower;
      const index: number = _.findIndex(list, (item) => item._id === value);
      multi.lrem(key, index, JSON.stringify(result));
      multi.exec((error: Error | null) => {
        if (error) {
          reject(error);
        }
        resolve();
      });
    });
  });
}

export function getFollowersFromRedisCache(key: string): Promise<IFollower[]> {
  return new Promise((resolve, reject) => {
    client.lrange(key, 0, -1, (err: Error | null, response: string[]) => {
      if (err) {
        reject(err);
      }
      const list: IFollower[] = [];
      for (const item of response) {
        list.push(Helpers.parseJson(item));
      }
      resolve(list);
    });
  });
}

export { client as redisClient };
