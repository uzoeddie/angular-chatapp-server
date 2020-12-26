import redis, { Multi, RedisClient } from 'redis';
import _ from 'lodash';
import Logger from 'bunyan';
import { config } from '@root/config';

const client: RedisClient = redis.createClient();
const log: Logger = config.createLogger('messageCache');

client.on('error', function(error) {
    log.error(error);
});

export function addChatListToRedisCache(keys: string[], value: any): Promise<void> {
    return new Promise((resolve, reject) => {
        for (const key of keys) {
            client.lrange(`chatList:${key}`, 0, -1, (err, response) => {
                if (err)  { reject(err) };
                const multi = client.multi();
                if (response.length > 0) {
                    let list = [];
                    for (const responseItem of response) {
                        list.push(JSON.parse(responseItem));
                        multi.ltrim(`chatList:${key}`, 1, -1);
                    }
                    _.remove(list, (item: any) => item.conversationId === value.conversationId);
                    list = [...list, value];
                    for (const listItem of list) {
                        multi.rpush(`chatList:${key}`, JSON.stringify(listItem));
                    }
                } else {
                    multi.rpush(`chatList:${key}`, JSON.stringify(value));
                }
                multi.exec((error) => {
                    if (error) { reject(error) };
                    resolve();
                });
            });
        }
    });
}

export function addChatmessageToRedisCache(key: string, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
        client.lrange(`messages:${key}`, 0, -1, (err, reply) => {
            if (err)  { reject(err) };
            const multi = client.multi();
            if (reply.length <= 20) {
                multi.rpush(`messages:${key}`, JSON.stringify(value));
            } else {
                multi.lpop(`messages:${key}`);
                multi.rpush(`messages:${key}`, JSON.stringify(value));
            }
            multi.exec((error) => {
                if (error) { reject(error) };
                resolve();
            });
        });
    });
}

export function updateIsReadPropInRedisCache(keyOne: string, keyTwo: string, conversationId: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const multi = client.multi();
        client.lrange(`chatList:${keyOne}`, 0, -1, (error, response) => {
            if (error) { reject(error); }
            updateChatList(multi, response, keyOne, conversationId);
            client.lrange(`chatList:${keyTwo}`, 0, -1, (error1, response1) => {
                if (error1) { reject(error1); }
                updateChatList(multi, response1, keyTwo, conversationId);
            });
            client.lrange(`messages:${conversationId}`, 0, -1, (err, response2) => {
                if (err) { reject(err) };
                for (const value of response2) {
                    const parsedMessages = JSON.parse(value);
                    parsedMessages.isRead = true;
                    multi.ltrim(`messages:${conversationId}`, 1, -1);
                    multi.rpush(`messages:${conversationId}`, JSON.stringify(parsedMessages));
                }
                multi.exec((error) => {
                    if (error) { reject(error) };
                    resolve();
                });
            });
        });
    });
}

export function getChatFromRedisCache(key: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        client.lrange(key, 0, -1, (error, response) => {
            if (error)  { reject(error) };
            resolve(response)
        });
    });
}

function updateChatList(multi: Multi, response: any, key: string, conversationId: string): void {
    let list = [];
    for (const value of response) {
        list.push(JSON.parse(value));
        multi.ltrim(`chatList:${key}`, 1, -1);
    }
    const result = _.find(list, (item: any) => item.conversationId === conversationId);
    result.isRead = true;
    const index = _.findIndex(list, (item: any) => item.conversationId === conversationId);
    list.splice(index, 1, result);
    for (const listItem of list) {
        multi.rpush(`chatList:${key}`, JSON.stringify(listItem));
    }
}

export { client as redisClient };