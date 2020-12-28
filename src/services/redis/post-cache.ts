/* eslint-disable @typescript-eslint/no-explicit-any */
import redis, { Multi, RedisClient } from 'redis';
import { Helpers } from '@global/helpers';
import { ICreatePost, IPostDocument } from '@posts/interface/post.interface';
import Logger from 'bunyan';
import { config } from '@root/config';

const client: RedisClient = redis.createClient();
const log: Logger = config.createLogger('postCache');

client.on('error', function (error) {
  log.error(error);
});

export function savePostsToRedisCache(key: string, uId: number, createdPost: IPostDocument): Promise<void> {
  const { _id, userId, username, email, avatarColor, post, bgColor, feelings, privacy, gifUrl, reactions, imgId, imgVersion, comments, createdAt, profilePicture } = createdPost;
  const firstList: string[] = ['_id', `${_id}`, 'userId', `${userId}`, 'username', `${username}`, 'email', `${email}`, 'avatarColor', `${avatarColor}`, 'post', `${post}`, 'bgColor', `${bgColor}`, 'feelings', JSON.stringify(feelings), 'privacy', JSON.stringify(privacy), 'gifUrl', `${gifUrl}`];
  const secondList: string[] = ['reactions', JSON.stringify(reactions), 'imgId', `${imgId}`, 'imgVersion', `${imgVersion}`, 'comments', JSON.stringify(comments), 'createdAt', `${createdAt}`, 'profilePicture', `${profilePicture}`];
  const dataToSave: string[] = [...firstList, ...secondList];
  return new Promise((resolve, reject) => {
    client.hmset(`posts:${key}`, dataToSave, (error) => {
      if (error) {
        reject(error);
      }
      client.zadd('post', uId, `${key}`);
      resolve();
    });
  });
}

export function updatePostInRedisCache(key: string, createdPost: ICreatePost): Promise<void> {
  const { post, bgColor, feelings, privacy, gifUrl, imgId, imgVersion, createdAt, profilePicture } = createdPost;
  const firstList: string[] = ['post', `${post}`, 'bgColor', `${bgColor}`, 'feelings', JSON.stringify(feelings), 'privacy', JSON.stringify(privacy), 'gifUrl', `${gifUrl}`];
  const secondList: string[] = ['imgId', `${imgId}`, 'imgVersion', `${imgVersion}`, 'createdAt', `${createdAt}`, 'profilePicture', `${profilePicture}`];
  const dataToSave: string[] = [...firstList, ...secondList];
  return new Promise((resolve, reject) => {
    client.hmset(`posts:${key}`, dataToSave, (error: Error | null) => {
      if (error) {
        reject(error);
      }
      resolve();
    });
  });
}

export function updateSinglePostPropInRedisCache(key: string, prop: string, value: string): Promise<void> {
  const dataToSave: string[] = [`${prop}`, JSON.stringify(value)];
  return new Promise((resolve, reject) => {
    client.hmset(`posts:${key}`, dataToSave, (error) => {
      if (error) {
        reject(error);
      }
      resolve();
    });
  });
}

export function getPostsFromCache(key: string, start: number, end: number): Promise<IPostDocument[]> {
  return new Promise((resolve, reject) => {
    client.zrevrange(key, start, end, (err: Error | null, reply: string[]) => {
      if (err) {
        reject(err);
      }
      const multi = client.multi();
      for (const value of reply) {
        multi.hgetall(`posts:${value}`);
      }
      multi.exec((error, replies) => {
        if (error) {
          reject(error);
        }
        for (const reply of replies) {
          reply.feelings = Helpers.parseJson(reply.feelings);
          reply.comments = Helpers.parseJson(reply.comments);
          reply.privacy = Helpers.parseJson(reply.privacy);
          reply.userId = Helpers.parseJson(reply.userId);
          reply.reactions = Object.keys(Helpers.parseJson(reply.reactions)).length ? Helpers.formattedReactions(Helpers.parseJson(reply.reactions)) : [];
          reply.createdAt = new Date(reply.createdAt);
        }
        resolve(replies);
      });
    });
  });
}

export function getSinglePostFromCache(key: string): Promise<IPostDocument[]> {
  return new Promise((resolve, reject) => {
    client.hgetall(`posts:${key}`, (err: Error | null, reply: any) => {
      if (err) {
        reject(err);
      }
      reply.feelings = Helpers.parseJson(reply.feelings);
      reply.comments = Helpers.parseJson(reply.comments);
      reply.privacy = Helpers.parseJson(reply.privacy);
      reply.userId = Helpers.parseJson(reply.userId);
      reply.reactions = (Object.keys(Helpers.parseJson(reply.reactions)).length ? Helpers.formattedReactions(Helpers.parseJson(reply.reactions)) : []) as any;
      reply.createdAt = Helpers.parseJson(reply.createdAt);
      resolve([reply]);
    });
  });
}

export function getUserPostsFromCache(key: string, uId: number): Promise<IPostDocument[]> {
  return new Promise((resolve, reject) => {
    client.zrangebyscore(key, uId, uId, (err: Error | null, reply: string[]) => {
      if (err) {
        reject(err);
      }
      const multi: Multi = client.multi();
      for (const key of reply) {
        multi.hgetall(`posts:${key}`);
      }
      multi.exec((error: Error | null, replies: any[]) => {
        if (error) {
          reject(error);
        }
        for (const reply of replies) {
          reply.feelings = Helpers.parseJson(reply.feelings);
          reply.comments = Helpers.parseJson(reply.comments);
          reply.privacy = Helpers.parseJson(reply.privacy);
          reply.userId = Helpers.parseJson(reply.userId);
          reply.reactions = Object.keys(Helpers.parseJson(reply.reactions)).length ? Helpers.formattedReactions(Helpers.parseJson(reply.reactions)) : [];
          reply.createdAt = Helpers.parseJson(reply.createdAt);
        }
        resolve(replies);
      });
    });
  });
}

export function deletePostFromCache(key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    client.zrem('post', `${key}`, (err: Error | null) => {
      if (err) {
        reject(err);
      }
      const multi: Multi = client.multi();
      multi.del(`posts:${key}`);
      multi.del(`comments:${key}`);
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
