import { Multi } from 'redis';
import _ from 'lodash';
import { IFollower } from '@followers/interface/followers.interface';
import { Helpers } from '@global/helpers';
import { BaseCache } from '@redis/base.cache';
class FollowerCache extends BaseCache {
  constructor() {
    super('followersCache');
  }

  public saveFollowerToRedisCache(key: string, value: IFollower): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.lpush(key, JSON.stringify(value), (error: Error | null) => {
        if (error) {
          reject(error);
        }
        resolve();
      });
    });
  }

  public removeFollowerFromRedisCache(key: string, value: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const multi: Multi = this.client.multi();
      this.client.lrange(key, 0, -1, (error: Error | null, response: string[]) => {
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

  public getFollowersFromRedisCache(key: string): Promise<IFollower[]> {
    return new Promise((resolve, reject) => {
      this.client.lrange(key, 0, -1, (err: Error | null, response: string[]) => {
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
}

export const followerCache: FollowerCache = new FollowerCache();
