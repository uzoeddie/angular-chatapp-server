/* eslint-disable @typescript-eslint/no-explicit-any */
import { Multi } from 'redis';
import _ from 'lodash';
import { INotificationSettings, IUserDocument } from '@user/interface/user.interface';
import { Helpers } from '@global/helpers';
import { BaseCache } from '@redis/base.cache';

class UserCache extends BaseCache {
  constructor() {
    super('userCache');
  }

  public saveUserToRedisCache(key: string, userId: string, createdUser: IUserDocument): Promise<void> {
    const {
      _id,
      uId,
      username,
      email,
      avatarColor,
      birthDay,
      postCount,
      gender,
      quotes,
      about,
      relationship,
      blocked,
      blockedBy,
      bgImageVersion,
      bgImageId,
      work,
      school,
      placesLived,
      createdAt,
      followersCount,
      followingCount,
      notifications,
      profilePicture
    } = createdUser;
    const firstList: string[] = [
      '_id',
      `${_id}`,
      'uId',
      `${uId}`,
      'username',
      `${username}`,
      'email',
      `${email}`,
      'avatarColor',
      `${avatarColor}`,
      'createdAt',
      `${createdAt}`,
      'birthDay',
      JSON.stringify(birthDay),
      'postCount',
      `${postCount}`
    ];
    const secondList: string[] = [
      'gender',
      `${gender}`,
      'quotes',
      `${quotes}`,
      'about',
      `${about}`,
      'relationship',
      `${relationship}`,
      'blocked',
      JSON.stringify(blocked)
    ];
    const thirdList: string[] = [
      'blockedBy',
      JSON.stringify(blockedBy),
      'bgImageVersion',
      `${bgImageVersion}`,
      'bgImageId',
      `${bgImageId}`,
      'work',
      JSON.stringify(work),
      'school',
      JSON.stringify(school),
      'placesLived',
      JSON.stringify(placesLived)
    ];
    const fourthList: string[] = [
      'followersCount',
      `${followersCount}`,
      'followingCount',
      `${followingCount}`,
      'notifications',
      JSON.stringify(notifications),
      'profilePicture',
      `${profilePicture}`
    ];
    const dataToSave: string[] = [...firstList, ...secondList, ...thirdList, ...fourthList];
    return new Promise((resolve, reject) => {
      this.client.hmset(`users:${key}`, dataToSave, (error: Error | null) => {
        if (error) {
          reject(error);
        }
        this.client.zadd('user', userId, `${key}`);
        resolve();
      });
    });
  }

  public getUserFromCache(key: string): Promise<IUserDocument> {
    return new Promise((resolve, reject) => {
      this.client.hgetall(`users:${key}`, (error: Error | null, response: any) => {
        if (error) {
          reject(error);
        }
        if (response === null || response === undefined) {
          return;
        }
        response.createdAt = new Date(Helpers.parseJson(response.createdAt));
        response.postCount = Helpers.parseJson(response.postCount);
        response.birthDay = Helpers.parseJson(response.birthDay);
        response.blocked = Helpers.parseJson(response.blocked);
        response.blockedBy = Helpers.parseJson(response.blockedBy);
        response.work = Helpers.parseJson(response.work);
        response.school = Helpers.parseJson(response.school);
        response.placesLived = Helpers.parseJson(response.placesLived);
        response.followersCount = Helpers.parseJson(response.followersCount);
        response.followingCount = Helpers.parseJson(response.followingCount);
        response.notifications = Helpers.parseJson(response.notifications);
        resolve(response);
      });
    });
  }

  public getUsersFromCache(start: number, end: number, excludedKey: string): Promise<IUserDocument[]> {
    return new Promise((resolve, reject) => {
      this.client.zrange('user', start, end, (err: Error | null, reply: string[]) => {
        if (err) {
          reject(err);
        }
        const multi: Multi = this.client.multi();
        for (const key of reply) {
          if (key !== excludedKey) {
            multi.hgetall(`users:${key}`);
          }
        }
        multi.exec((error: Error | null, replies: any[]) => {
          if (error) {
            reject(error);
          }
          for (const reply of replies) {
            reply.createdAt = new Date(Helpers.parseJson(reply.createdAt));
            reply.birthDay = Helpers.parseJson(reply.birthDay);
            reply.postCount = Helpers.parseJson(reply.postCount);
            reply.blocked = Helpers.parseJson(reply.blocked);
            reply.blockedBy = Helpers.parseJson(reply.blockedBy);
            reply.work = Helpers.parseJson(reply.work);
            reply.school = Helpers.parseJson(reply.school);
            reply.placesLived = Helpers.parseJson(reply.placesLived);
            reply.followersCount = Helpers.parseJson(reply.followersCount);
            reply.followingCount = Helpers.parseJson(reply.followingCount);
            reply.notifications = Helpers.parseJson(reply.notifications);
          }
          resolve(replies);
        });
      });
    });
  }

  public updateUserFollowersInRedisCache(key: string, prop: string, value: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.hincrby(`users:${key}`, prop, value, (error: Error | null) => {
        if (error) {
          reject(error);
        }
        resolve();
      });
    });
  }

  public updateBlockedUserPropInRedisCache(key: string, prop: string, value: string, type: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.hget(`users:${key}`, prop, (error: Error | null, response: string) => {
        if (error) {
          reject(error);
        }
        const multi: Multi = this.client.multi();
        let blocked: string[] = Helpers.parseJson(response);
        if (type === 'block') {
          blocked = [...blocked, value];
        } else {
          _.remove(blocked, (id: string) => id === value);
          blocked = [...blocked];
        }
        const dataToSave: string[] = [`${prop}`, JSON.stringify(blocked)];
        multi.hmset(`users:${key}`, dataToSave);
        multi.exec((error) => {
          if (error) {
            reject(error);
          }
          resolve();
        });
      });
    });
  }

  public updateNotificationSettingInCache(key: string, prop: string, value: INotificationSettings): Promise<void> {
    const dataToSave: string[] = [`${prop}`, JSON.stringify(value)];
    return new Promise((resolve, reject) => {
      this.client.hmset(`users:${key}`, dataToSave, (error: Error | null) => {
        if (error) {
          reject(error);
        }
        resolve();
      });
    });
  }
}

export const userCache: UserCache = new UserCache();
