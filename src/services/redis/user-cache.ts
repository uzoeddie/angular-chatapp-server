/* eslint-disable @typescript-eslint/no-explicit-any */
import redis, { Multi, RedisClient } from 'redis';
import _ from 'lodash';
import { INotificationSettings, IUserDocument } from '@user/interface/user.interface';
import Logger from 'bunyan';
import { config } from '@root/config';
import { Helpers } from '@global/helpers';

const REDIS_PORT = 6379;
const client: RedisClient = redis.createClient({ host: config.REDIS_HOST! || 'localhost', port: REDIS_PORT });
const log: Logger = config.createLogger('userCache');

client.on('error', function (error) {
  log.error(error);
});

export function saveUserToRedisCache(key: string, userId: string, createdUser: IUserDocument): Promise<void> {
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
    client.hmset(`users:${key}`, dataToSave, (error: Error | null) => {
      if (error) {
        reject(error);
      }
      client.zadd('user', userId, `${key}`);
      resolve();
    });
  });
}

export function getUserFromCache(key: string): Promise<IUserDocument> {
  return new Promise((resolve, reject) => {
    client.hgetall(`users:${key}`, (error: Error | null, response: any) => {
      if (error) {
        reject(error);
      }
      if (response === null || response === undefined) {
        return;
      }
      response.createdAt = new Date(Helpers.parseJson(response.createdAt));
      response.uId = Helpers.parseJson(response.uId);
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

export function getUsersFromCache(start: number, end: number, excludedKey: string): Promise<IUserDocument[]> {
  return new Promise((resolve, reject) => {
    client.zrange('user', start, end, (err: Error | null, reply: string[]) => {
      if (err) {
        reject(err);
      }
      const multi: Multi = client.multi();
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
          reply.uId = Helpers.parseJson(reply.uId);
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

export function updateUserFollowersInRedisCache(key: string, prop: string, value: number): Promise<void> {
  return new Promise((resolve, reject) => {
    client.hincrby(`users:${key}`, prop, value, (error: Error | null) => {
      if (error) {
        reject(error);
      }
      resolve();
    });
  });
}

export function updateBlockedUserPropInRedisCache(key: string, prop: string, value: string, type: string): Promise<void> {
  return new Promise((resolve, reject) => {
    client.hget(`users:${key}`, prop, (error: Error | null, response: string) => {
      if (error) {
        reject(error);
      }
      const multi: Multi = client.multi();
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

export function updateNotificationSettingInCache(key: string, prop: string, value: INotificationSettings): Promise<void> {
  const dataToSave: string[] = [`${prop}`, JSON.stringify(value)];
  return new Promise((resolve, reject) => {
    client.hmset(`users:${key}`, dataToSave, (error: Error | null) => {
      if (error) {
        reject(error);
      }
      resolve();
    });
  });
}

export { client as userCacheRedisClient };
