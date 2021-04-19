/* eslint-disable @typescript-eslint/no-explicit-any */
import { Multi } from 'redis';
import _ from 'lodash';
import { IUserBirthDay, IUserDocument, IUserPlacesLived, IUserSchool, IUserWork } from '@user/interface/user.interface';
import { Helpers } from '@global/helpers';
import { BaseCache } from '@redis/base.cache';

type ListType = IUserPlacesLived | IUserWork | IUserSchool;
type UserItem = string | number | IUserBirthDay | ListType | null;

class UserInfoCache extends BaseCache {
  constructor() {
    super('userInfoCache');
  }

  public updateSingleUserItemInRedisCache(key: string, prop: string, value: UserItem): Promise<IUserDocument> {
    return new Promise((resolve, reject) => {
      let dataToSave: string[];
      if (prop === 'birthDay') {
        dataToSave = ['birthDay', JSON.stringify(value)];
      } else {
        dataToSave = [`${prop}`, `${value}`];
      }
      this.client.hmset(`users:${key}`, dataToSave, (error: Error | null) => {
        if (error) {
          reject(error);
        }
        const multi: Multi = this.client.multi();
        multi.hgetall(`users:${key}`);
        multi.exec((error: Error | null, response: any) => {
          if (error) {
            reject(error);
          }
          response[0].createdAt = new Date(Helpers.parseJson(response[0].createdAt));
          response[0].postCount = Helpers.parseJson(response[0].postCount);
          response[0].birthDay = Helpers.parseJson(response[0].birthDay);
          response[0].blocked = Helpers.parseJson(response[0].blocked);
          response[0].blockedBy = Helpers.parseJson(response[0].blockedBy);
          response[0].work = Helpers.parseJson(response[0].work);
          response[0].school = Helpers.parseJson(response[0].school);
          response[0].placesLived = Helpers.parseJson(response[0].placesLived);
          response[0].followersCount = Helpers.parseJson(response[0].followersCount);
          response[0].followingCount = Helpers.parseJson(response[0].followingCount);
          response[0].notifications = Helpers.parseJson(response[0].notifications);
          resolve(response[0]);
        });
      });
    });
  }

  public updateUserPropListInfoInRedisCache(
    key: string,
    prop: string,
    value: ListType,
    type: string,
    deletedItemId?: string
  ): Promise<IUserDocument> {
    return new Promise((resolve, reject) => {
      this.client.hget(`users:${key}`, prop, (error: Error | null, response: string) => {
        if (error) {
          reject(error);
        }
        const multi: Multi = this.client.multi();
        let list: ListType[] = Helpers.parseJson(response);
        if (type === 'add') {
          list = [...list, value];
        } else if (type === 'remove') {
          _.remove(list, (item: ListType) => item._id === deletedItemId);
          list = [...list];
        } else if (type === 'edit') {
          _.remove(list, (item: ListType) => item._id === value._id);
          list = [...list, value];
        }
        const dataToSave: string[] = [`${prop}`, JSON.stringify(list)];
        multi.hmset(`users:${key}`, dataToSave);
        multi.hgetall(`users:${key}`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        multi.exec((error: Error | null, response: any) => {
          if (error) {
            reject(error);
          }
          response[1].createdAt = new Date(Helpers.parseJson(response[1].createdAt));
          response[1].postCount = Helpers.parseJson(response[1].postCount);
          response[1].birthDay = Helpers.parseJson(response[1].birthDay);
          response[1].blocked = Helpers.parseJson(response[1].blocked);
          response[1].blockedBy = Helpers.parseJson(response[1].blockedBy);
          response[1].work = Helpers.parseJson(response[1].work);
          response[1].school = Helpers.parseJson(response[1].school);
          response[1].placesLived = Helpers.parseJson(response[1].placesLived);
          response[1].followersCount = Helpers.parseJson(response[1].followersCount);
          response[1].followingCount = Helpers.parseJson(response[1].followingCount);
          response[1].notifications = Helpers.parseJson(response[1].notifications);
          resolve(response[1]);
        });
      });
    });
  }
}

export const userInfoCache: UserInfoCache = new UserInfoCache();
