import redis, { RedisClient } from 'redis';
import { Helpers } from '@global/helpers';
import { ICreatePost, IPostDocument } from '@posts/interface/post.interface';
import Logger from 'bunyan';
import _ from 'lodash';
import { config } from '@root/config';

const client: RedisClient = redis.createClient();
const log: Logger = config.createLogger('postCache');

client.on('error', function(error) {
    log.error(error);
});

export function savePostsToRedisCache(key: string, uId: number, createdPost: IPostDocument): Promise<void> {
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
    const firstList: string[] = ['_id', `${_id}`, 'userId', JSON.stringify(userId), 'username', `${username}`, 'email', `${email}`, 'avatarColor', `${avatarColor}`, 'post', `${post}`, 'bgColor', `${bgColor}`, 'feelings', JSON.stringify(feelings), 'privacy', JSON.stringify(privacy), 'gifUrl', `${gifUrl}`];
    const secondList: string[] = ['reactions', JSON.stringify(reactions), 'imgId', `${imgId}`, 'imgVersion', `${imgVersion}`, 'comments', JSON.stringify(comments), 'createdAt', JSON.stringify(createdAt), 'profilePicture', `${profilePicture}`];
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
    const {
        post,
        bgColor,
        feelings,
        privacy,
        gifUrl,
        imgId,
        imgVersion,
        createdAt,
        profilePicture
    } = createdPost;
    const firstList: string[] = ['post', `${post}`, 'bgColor', `${bgColor}`, 'feelings', JSON.stringify(feelings), 'privacy', JSON.stringify(privacy), 'gifUrl', `${gifUrl}`];
    const secondList: string[] = ['imgId', `${imgId}`, 'imgVersion', `${imgVersion}`, 'createdAt', JSON.stringify(createdAt), 'profilePicture', `${profilePicture}`];
    const dataToSave: string[] = [...firstList, ...secondList];
    return new Promise((resolve, reject) => {
        client.hmset(`posts:${key}`, dataToSave, (error, _response) => {
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
    return new Promise<any>((resolve, reject) => {
        client.zrevrange(key, start, end, (err, reply) => {
            if (err)  { reject(err) };
            const multi = client.multi();
            for(const value of reply) {
                multi.hgetall(`posts:${value}`);
            }
            multi.exec((error, replies) => {
                if (error)  { reject(error) };
                for (const reply of replies) {
                    reply.feelings = JSON.parse(reply.feelings);
                    reply.comments = JSON.parse(reply.comments);
                    reply.privacy = JSON.parse(reply.privacy);
                    reply.userId = JSON.parse(reply.userId);
                    reply.reactions = Object.keys(JSON.parse(reply.reactions)).length ? Helpers.formattedReactions(JSON.parse(reply.reactions)) : [];
                    reply.createdAt = new Date(JSON.parse(reply.createdAt));
                }
                resolve(replies);
            });
        });
    })
}

export function getSinglePostFromCache(key: string): Promise<IPostDocument[]> {
    return new Promise<any>((resolve, reject) => {
        client.hgetall(`posts:${key}`, (err, reply) => {
            if (err)  { reject(err) };
            reply.feelings = JSON.parse(reply.feelings);
            reply.comments = JSON.parse(reply.comments);
            reply.privacy = JSON.parse(reply.privacy);
            reply.userId = JSON.parse(reply.userId);
            reply.reactions = (Object.keys(JSON.parse(reply.reactions)).length ? Helpers.formattedReactions(JSON.parse(reply.reactions)) : []) as any;
            reply.createdAt = JSON.parse(reply.createdAt);
            resolve([reply]);
        });
    })
}

export function getUserPostsFromCache(key: string, uId: number): Promise<IPostDocument[]> {
    return new Promise<any>((resolve, reject) => {
        client.zrangebyscore(key, uId, uId, (err, reply) => {
            if (err)  { reject(err) };
            const multi = client.multi();
            for(const key of reply){
                multi.hgetall(`posts:${key}`);
            }
            multi.exec((error, replies) => {
                if (error)  { reject(error) };
                for (const reply of replies) {
                    reply.feelings = JSON.parse(reply.feelings);
                    reply.comments = JSON.parse(reply.comments);
                    reply.privacy = JSON.parse(reply.privacy);
                    reply.userId = JSON.parse(reply.userId);
                    reply.reactions = Object.keys(JSON.parse(reply.reactions)).length ? Helpers.formattedReactions(JSON.parse(reply.reactions)) : [];
                    reply.createdAt = JSON.parse(reply.createdAt);
                }
                resolve(replies);
            });
        });
    })
}

export function deletePostFromCache(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
        client.zrem(`post`, `${key}`, (err) => {
            if (err)  { reject(err) };
            const multi = client.multi();
            multi.del(`posts:${key}`);
            multi.del(`comments:${key}`);
            multi.exec((error, _replies) => {
                if (error)  { reject(error) };
                resolve();
            });
        });
    });
}

export { client as redisClient };