/* eslint-disable @typescript-eslint/no-explicit-any */
import redis, { Multi, RedisClient } from 'redis';
import _ from 'lodash';
import { IUserDocument } from '@user/interface/user.interface';
import Logger from 'bunyan';
import { config } from '@root/config';

const client: RedisClient = redis.createClient();
const log: Logger = config.createLogger('userCache');

client.on('error', function (error) {
  log.error(error);
});

export function saveUserToRedisCache(key: string, userId: number, createdUser: IUserDocument): Promise<string> {
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
    JSON.stringify(createdAt),
    'birthDay',
    JSON.stringify(birthDay),
    'postCount',
    JSON.stringify(postCount)
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
    JSON.stringify(profilePicture)
  ];
  const dataToSave: string[] = [...firstList, ...secondList, ...thirdList, ...fourthList];
  return new Promise((resolve, reject) => {
    client.hmset(`users:${key}`, dataToSave, (error: Error | null, response: string) => {
      if (error) {
        reject(error);
      }
      client.zadd('user', userId, `${key}`);
      resolve(response);
    });
  });
}

export function getUserFromCache(key: string): Promise<IUserDocument> {
  return new Promise((resolve, reject) => {
    client.hgetall(`users:${key}`, (error: Error | null, response: any) => {
      if (error) {
        reject(error);
      }
      response.createdAt = JSON.parse(response.createdAt);
      response.uId = JSON.parse(response.uId);
      response.birthDay = JSON.parse(response.birthDay);
      response.postCount = JSON.parse(response.postCount);
      response.blocked = JSON.parse(response.blocked);
      response.blockedBy = JSON.parse(response.blockedBy);
      response.work = JSON.parse(response.work);
      response.school = JSON.parse(response.school);
      response.placesLived = JSON.parse(response.placesLived);
      response.followersCount = JSON.parse(response.followersCount);
      response.followingCount = JSON.parse(response.followingCount);
      response.notifications = JSON.parse(response.notifications);
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
          reply.createdAt = JSON.parse(reply.createdAt);
          reply.uId = JSON.parse(reply.uId);
          reply.birthDay = JSON.parse(reply.birthDay);
          reply.postCount = JSON.parse(reply.postCount);
          reply.blocked = JSON.parse(reply.blocked);
          reply.blockedBy = JSON.parse(reply.blockedBy);
          reply.work = JSON.parse(reply.work);
          reply.school = JSON.parse(reply.school);
          reply.placesLived = JSON.parse(reply.placesLived);
          reply.followersCount = JSON.parse(reply.followersCount);
          reply.followingCount = JSON.parse(reply.followingCount);
          reply.notifications = JSON.parse(reply.notifications);
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
    client.hget(`users:${key}`, prop, (error, response) => {
      if (error) {
        reject(error);
      }
      const multi = client.multi();
      let blocked = JSON.parse(response);
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

export function updateNotificationSettingInCache(key: string, prop: string, value: string): Promise<void> {
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

export { client as redisClient };
