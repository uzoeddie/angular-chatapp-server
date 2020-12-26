import redis, { RedisClient } from 'redis';
import Logger from 'bunyan';
import { config } from '@root/config';

const client: RedisClient = redis.createClient();
const log: Logger = config.createLogger('followersCache');

client.on('error', function(error) {
    log.error(error);
});

export function saveFollowerToRedisCache(key: any, value: string): Promise<void> {
    return new Promise((resolve, reject) => {
        client.lpush(`followers:${key}`, value, (error) => {
            if (error) {
                reject(error);
            }
            resolve();
        });
    });
}

export function removeFollowerFromRedisCache(key: any, value: string): Promise<void> {
    return new Promise((resolve, reject) => {
        client.lrem(`followers:${key}`, 0, value, (error) => {
            if (error) {
                reject(error);
            }
            resolve();
        });
    });
}

export function getFollowersFromRedisCache(key: string): Promise<string[]> {
    return new Promise<any>((resolve, reject) => {
        client.lrange(`followers:${key}`, 0, -1, (err, response) => {
            if (err)  { reject(err) };
            resolve(response);
        });
    })
}

export { client as redisClient };