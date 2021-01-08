import redis, { Multi, RedisClient } from 'redis';
import _ from 'lodash';
import Logger from 'bunyan';
import { config } from '@root/config';
import { IChatRedisData } from '@chat/interface/chat.interface';
import { Helpers } from '@global/helpers';
import { IConversationDocument } from '@chat/interface/converation.interface';

const PORT: number = parseInt(config.REDIS_PORT!, 10) || 6379;
const client: RedisClient = redis.createClient({ host: config.REDIS_HOST! || 'localhost', port: PORT });
const log: Logger = config.createLogger('messageCache');

client.on('error', function (error) {
  log.error(error);
});

// export function addUsersConversationToCache(key: string, conversationData: IConversationDocument): Promise<void> {
//   const { _id, participants } = conversationData;
//   const dataToSave: string[] = ['_id', `${_id}`, 'participants', `${participants}`];
//   return new Promise((resolve, reject) => {
//     client.hmset(`conversations:${key}`, dataToSave, (error) => {
//       if (error) {
//         reject(error);
//       }
//       resolve();
//     });
//   });
// }

// export function getConversationFromCache(key: string): Promise<IConversationDocument> {
//   return new Promise((resolve, reject) => {
//     client.hgetall(`conversations:${key}`, (err: Error | null, reply: any) => {
//       if (err) {
//         reject(err);
//       }
//       resolve(reply);
//     });
//   });
// }

export function addChatListToRedisCache(keys: string[], value: IChatRedisData): Promise<void> {
  return new Promise((resolve, reject) => {
    for (const key of keys) {
      client.lrange(`chatList:${key}`, 0, -1, (err: Error | null, response: string[]) => {
        if (err) {
          reject(err);
        }
        const multi: Multi = client.multi();
        if (response.length > 0) {
          let list: IChatRedisData[] = [];
          for (const responseItem of response) {
            list.push(Helpers.parseJson(responseItem));
            multi.ltrim(`chatList:${key}`, 1, -1);
          }
          _.remove(list, (item: IChatRedisData) => item.conversationId === value.conversationId);
          list = [...list, value];
          for (const listItem of list) {
            multi.rpush(`chatList:${key}`, JSON.stringify(listItem));
          }
        } else {
          multi.rpush(`chatList:${key}`, JSON.stringify(value));
        }
        multi.exec((error: Error | null) => {
          if (error) {
            reject(error);
          }
          resolve();
        });
      });
    }
  });
}

export function addChatmessageToRedisCache(key: string, value: IChatRedisData): Promise<void> {
  return new Promise((resolve, reject) => {
    client.lrange(`messages:${key}`, 0, -1, (err: Error | null, reply: string[]) => {
      if (err) {
        reject(err);
      }
      const multi: Multi = client.multi();
      if (reply.length <= 20) {
        multi.rpush(`messages:${key}`, JSON.stringify(value));
      } else {
        multi.lpop(`messages:${key}`);
        multi.rpush(`messages:${key}`, JSON.stringify(value));
      }
      multi.exec((error: Error | null) => {
        if (error) {
          reject(error);
        }
        resolve();
      });
    });
  });
}

export function updateIsReadPropInRedisCache(keyOne: string, keyTwo: string, conversationId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const multi: Multi = client.multi();
    client.lrange(`chatList:${keyOne}`, 0, -1, (error: Error | null, response: string[]) => {
      if (error) {
        reject(error);
      }
      updateChatList(multi, response, keyOne, conversationId);
      client.lrange(`chatList:${keyTwo}`, 0, -1, (error1: Error | null, response1: string[]) => {
        if (error1) {
          reject(error1);
        }
        updateChatList(multi, response1, keyTwo, conversationId);
      });
      client.lrange(`messages:${conversationId}`, 0, -1, (err: Error | null, response2: string[]) => {
        if (err) {
          reject(err);
        }
        for (const value of response2) {
          const parsedMessages = Helpers.parseJson(value);
          parsedMessages.isRead = true;
          multi.ltrim(`messages:${conversationId}`, 1, -1);
          multi.rpush(`messages:${conversationId}`, JSON.stringify(parsedMessages));
        }
        multi.lindex(`messages:${conversationId}`, 0);
        multi.exec((error: Error | null, response) => {
          if (error) {
            reject(error);
          }
          resolve(response[10]);
        });
      });
    });
  });
}

export function getChatFromRedisCache(key: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    client.lrange(key, 0, -1, (error: Error | null, response: string[]) => {
      if (error) {
        reject(error);
      }
      resolve(response);
    });
  });
}

export function getSingleChatObjectFromRedisCache(key: string): Promise<string> {
  return new Promise((resolve, reject) => {
    client.lindex(key, 0, (error: Error | null, response: string) => {
      if (error) {
        reject(error);
      }
      resolve(response);
    });
  });
}

function updateChatList(multi: Multi, response: string[], key: string, conversationId: string): void {
  const list: IChatRedisData[] = [];
  for (const value of response) {
    list.push(Helpers.parseJson(value));
    multi.ltrim(`chatList:${key}`, 1, -1);
  }
  const result: IChatRedisData = _.find(list, (item: IChatRedisData) => item.conversationId === conversationId) as IChatRedisData;
  result.isRead = true;
  const index: number = _.findIndex(list, (item: IChatRedisData) => item.conversationId === conversationId);
  list.splice(index, 1, result);
  for (const listItem of list) {
    multi.rpush(`chatList:${key}`, JSON.stringify(listItem));
  }
}

export { client as redisClient };
