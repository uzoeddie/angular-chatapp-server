/* eslint-disable @typescript-eslint/no-explicit-any */
import { Multi } from 'redis';
import { Helpers } from '@global/helpers';
import { IPostDocument } from '@posts/interface/post.interface';
import { BaseCache } from '@redis/base.cache';

class PostCache extends BaseCache {
  constructor() {
    super('postCache');
  }

  public savePostsToRedisCache(key: string, currentUserId: string, uId: number, createdPost: IPostDocument): Promise<void> {
    const {
      _id,
      userId,
      username,
      email,
      avatarColor,
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      reactions,
      imgId,
      imgVersion,
      comments,
      createdAt,
      profilePicture
    } = createdPost;
    const firstList: string[] = [
      '_id',
      `${_id}`,
      'userId',
      `${userId}`,
      'username',
      `${username}`,
      'email',
      `${email}`,
      'avatarColor',
      `${avatarColor}`,
      'post',
      `${post}`,
      'bgColor',
      `${bgColor}`,
      'feelings',
      JSON.stringify(feelings),
      'privacy',
      JSON.stringify(privacy),
      'gifUrl',
      `${gifUrl}`
    ];
    const secondList: string[] = [
      'reactions',
      JSON.stringify(reactions),
      'imgId',
      `${imgId}`,
      'imgVersion',
      `${imgVersion}`,
      'comments',
      JSON.stringify(comments),
      'createdAt',
      `${createdAt}`,
      'profilePicture',
      `${profilePicture}`
    ];
    const dataToSave: string[] = [...firstList, ...secondList];
    return new Promise((resolve, reject) => {
      this.client.hmget(`users:${currentUserId}`, 'postCount', (error: Error | null, response: string[]) => {
        if (error) {
          reject(error);
        }
        const multi: Multi = this.client.multi();
        multi.hmset(`posts:${key}`, dataToSave);
        multi.zadd('post', uId, `${key}`);
        const postCount = Helpers.parseJson(response[0]) + 1;
        multi.hmset(`users:${currentUserId}`, ['postCount', `${postCount}`]);
        multi.exec((error: Error | null) => {
          if (error) {
            reject(error);
          }
          resolve();
        });
      });
    });
  }

  public updatePostInRedisCache(key: string, createdPost: IPostDocument): Promise<IPostDocument> {
    const { post, bgColor, feelings, privacy, gifUrl, imgId, imgVersion, createdAt, profilePicture } = createdPost;
    const firstList: string[] = [
      'post',
      `${post}`,
      'bgColor',
      `${bgColor}`,
      'feelings',
      JSON.stringify(feelings),
      'privacy',
      JSON.stringify(privacy),
      'gifUrl',
      `${gifUrl}`
    ];
    const secondList: string[] = [
      'imgId',
      `${imgId}`,
      'imgVersion',
      `${imgVersion}`,
      'createdAt',
      `${createdAt}`,
      'profilePicture',
      `${profilePicture}`
    ];
    const dataToSave: string[] = [...firstList, ...secondList];
    return new Promise((resolve, reject) => {
      this.client.hmset(`posts:${key}`, dataToSave, (error: Error | null) => {
        if (error) {
          reject(error);
        }
        const multi: Multi = this.client.multi();
        multi.hgetall(`posts:${key}`);
        multi.exec((error, reply) => {
          if (error) {
            reject(error);
          }
          reply[0].feelings = Helpers.parseJson(reply[0].feelings);
          reply[0].comments = Helpers.parseJson(reply[0].comments);
          reply[0].privacy = Helpers.parseJson(reply[0].privacy);
          reply[0].userId = Helpers.parseJson(reply[0].userId);
          reply[0].reactions = Object.keys(Helpers.parseJson(reply[0].reactions)).length
            ? Helpers.formattedReactions(Helpers.parseJson(reply[0].reactions))
            : [];
          reply[0].createdAt = new Date(reply[0].createdAt);
          resolve(reply[0]);
        });
      });
    });
  }

  public updateSinglePostPropInRedisCache(key: string, prop: string, value: string): Promise<void> {
    const dataToSave: string[] = [`${prop}`, JSON.stringify(value)];
    return new Promise((resolve, reject) => {
      this.client.hmset(`posts:${key}`, dataToSave, (error) => {
        if (error) {
          reject(error);
        }
        resolve();
      });
    });
  }

  public getPostsFromCache(key: string, start: number, end: number): Promise<IPostDocument[]> {
    return new Promise((resolve, reject) => {
      this.client.zrevrange(key, start, end, (err: Error | null, reply: string[]) => {
        if (err) {
          reject(err);
        }
        const multi: Multi = this.client.multi();
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
            reply.reactions = Object.keys(Helpers.parseJson(reply.reactions)).length
              ? Helpers.formattedReactions(Helpers.parseJson(reply.reactions))
              : [];
            reply.createdAt = new Date(reply.createdAt);
          }
          resolve(replies);
        });
      });
    });
  }

  public getSinglePostFromCache(key: string): Promise<IPostDocument[]> {
    return new Promise((resolve, reject) => {
      this.client.hgetall(`posts:${key}`, (err: Error | null, reply: any) => {
        if (err) {
          reject(err);
        }
        reply.feelings = Helpers.parseJson(reply.feelings);
        reply.comments = Helpers.parseJson(reply.comments);
        reply.privacy = Helpers.parseJson(reply.privacy);
        reply.userId = Helpers.parseJson(reply.userId);
        reply.reactions = Object.keys(Helpers.parseJson(reply.reactions)).length
          ? Helpers.formattedReactions(Helpers.parseJson(reply.reactions))
          : [];
        reply.createdAt = new Date(Helpers.parseJson(reply.createdAt));
        resolve([reply]);
      });
    });
  }

  public getUserPostsFromCache(key: string, uId: number): Promise<IPostDocument[]> {
    return new Promise((resolve, reject) => {
      this.client.zrangebyscore(key, uId, uId, (err: Error | null, reply: string[]) => {
        if (err) {
          reject(err);
        }
        const multi: Multi = this.client.multi();
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
            reply.reactions = Object.keys(Helpers.parseJson(reply.reactions)).length
              ? Helpers.formattedReactions(Helpers.parseJson(reply.reactions))
              : [];
            reply.createdAt = new Date(Helpers.parseJson(reply.createdAt));
          }
          resolve(replies);
        });
      });
    });
  }

  public deletePostFromCache(key: string, currentUserId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.hmget(`users:${currentUserId}`, 'postCount', (error: Error | null, response: string[]) => {
        if (error) {
          reject(error);
        }
        const multi: Multi = this.client.multi();
        multi.zrem('post', `${key}`);
        multi.del(`posts:${key}`);
        multi.del(`comments:${key}`);
        const postCount = Helpers.parseJson(response[0]) - 1;
        multi.hmset(`users:${currentUserId}`, ['postCount', `${postCount}`]);
        multi.exec((error: Error | null) => {
          if (error) {
            reject(error);
          }
          resolve();
        });
      });
    });
  }
}

export const postCache: PostCache = new PostCache();
