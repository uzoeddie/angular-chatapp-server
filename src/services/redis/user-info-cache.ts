import redis, { Multi, RedisClient } from 'redis';
import _ from 'lodash';
import Logger from 'bunyan';
import { config } from '@root/config';
import { IUserBirthDay, IUserPlacesLived, IUserSchool, IUserWork } from '@user/interface/user.interface';

const client: RedisClient = redis.createClient();
const log: Logger = config.createLogger('userInfoCache');

client.on('error', function (error) {
  log.error(error);
});

type ListType = IUserPlacesLived | IUserWork | IUserSchool;
type UserItem = string | number | IUserBirthDay | ListType | null;

export function updateSingleUserItemInRedisCache(key: string, prop: string, value: UserItem): Promise<void> {
  return new Promise((resolve, reject) => {
    const dataToSave: string[] = [`${prop}`, `${value}`];
    client.hmset(`users:${key}`, dataToSave, (error: Error | null) => {
      if (error) {
        reject(error);
      }
      resolve();
    });
  });
}

export function updateUserPropListInfoInRedisCache(key: string, prop: string, value: ListType, type: string): Promise<void> {
  return new Promise((resolve, reject) => {
    client.hget(`users:${key}`, prop, (error: Error | null, response: string) => {
      if (error) {
        reject(error);
      }
      const multi: Multi = client.multi();
      let list: ListType[] = JSON.parse(response);
      if (type === 'add') {
        list = [...list, value];
      } else if (type === 'remove') {
        _.remove(list, (item: ListType) => item._id === value._id);
        list = [...list];
      } else if (type === 'edit') {
        _.remove(list, (item: ListType) => item._id === value._id);
        list = [...list, value];
      }
      const dataToSave: string[] = [`${prop}`, JSON.stringify(list)];
      multi.hmset(`users:${key}`, dataToSave);
      multi.exec((error: Error | null) => {
        if (error) {
          reject(error);
        }
        resolve();
      });
    });
  });
}

export { client as redisClient };
