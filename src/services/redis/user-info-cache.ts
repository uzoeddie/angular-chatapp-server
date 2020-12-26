import redis, { RedisClient } from 'redis';
import _ from 'lodash';
import Logger from 'bunyan';
import { config } from '@root/config';

const client: RedisClient = redis.createClient();
const log: Logger = config.createLogger('userInfoCache');

client.on('error', function(error) {
    log.error(error);
});

export function updateSingleUserItemInRedisCache(key: string, prop: string, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
        const dataToSave: string[] = [`${prop}`, `${value}`];
        client.hmset(`users:${key}`, dataToSave, (error) => {
            if (error) {
                reject(error);
            }
            resolve();
        });
    });
}

export function updateUserPropListInfoInRedisCache(key: any, prop: string, value: any, type: string): Promise<void> {
    return new Promise((resolve, reject) => {
        client.hget(`users:${key}`, prop, (error, response) => {
            if (error) { reject(error); }
            const multi = client.multi();
            let list = JSON.parse(response);
            if (type === 'add') {
                list = [...list, value];
            } else if (type === 'remove') {
                _.remove(list, (item: any) => item._id === value._id);
                list = [...list];
            } else if (type === 'edit') {
                _.remove(list, (item: any) => item._id === value._id);
                list = [...list, value];
            }
            const dataToSave: string[] = [`${prop}`, JSON.stringify(list)];
            multi.hmset(`users:${key}`, dataToSave);
            multi.exec((error) => {
                if (error) { reject(error) };
                resolve();
            });
        });
    });
}

export { client as redisClient };