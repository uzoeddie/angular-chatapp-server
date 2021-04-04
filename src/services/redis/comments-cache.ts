import redis, { Multi, RedisClient } from 'redis';
import Logger from 'bunyan';
import { config } from '@root/config';
import { ICommentDocument, IReactionDocument, IReactionObject, IRedisCommentList } from '@comments/interface/comment.interface';
import { Helpers } from '@global/helpers';
import _ from 'lodash';

const REDIS_PORT = 6379;
const client: RedisClient = redis.createClient({ host: config.REDIS_HOST! || 'localhost', port: REDIS_PORT });
const log: Logger = config.createLogger('commentsCache');

client.on('error', function (error) {
  log.error(error);
});

export function savePostCommentToRedisCache(key: string, value: string): Promise<void> {
  return new Promise((resolve, reject) => {
    client.lpush(`comments:${key}`, value, (error: Error | null) => {
      if (error) {
        reject(error);
      }
      resolve();
    });
  });
}

export function savePostReactionToRedisCache(key: string, value: string, previousReaction?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const multi: Multi = client.multi();
    let reaction: IReactionDocument | undefined = Helpers.parseJson(value);
    client.lrange(`reactions:${key}`, 0, -1, (error: Error | null, response: string[]) => {
      if (error) {
        reject(error);
      }
      if (previousReaction) {
        const reactionObject: IReactionObject = {
          postId: reaction!.postId,
          previousReaction,
          username: reaction!.username
        };
        reaction = updateReaction(multi, key, response, reactionObject, reaction);
      }
      multi.lpush(`reactions:${key}`, JSON.stringify(reaction));
      multi.exec((error: Error | null) => {
        if (error) {
          reject(error);
        }
        resolve();
      });
    });
  });
}

export function removeReactionFromCache(key: string, previousReaction: string, username: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const multi: Multi = client.multi();
    client.lrange(`reactions:${key}`, 0, -1, (error: Error | null, response: string[]) => {
      if (error) {
        reject(error);
      }
      const reactionObject: IReactionObject = {
        postId: key,
        previousReaction,
        username
      };
      updateReaction(multi, key, response, reactionObject);
      multi.exec((error: Error | null) => {
        if (error) {
          reject(error);
        }
        resolve();
      });
    });
  });
}

export function getCommentNamesFromCache(key: string): Promise<IRedisCommentList> {
  return new Promise((resolve, reject) => {
    client.llen(`comments:${key}`, (err: Error | null, reply: number) => {
      if (err) {
        reject(err);
      }
      const multi: Multi = client.multi();
      multi.lrange(`comments:${key}`, 0, -1);
      multi.exec((error, replies) => {
        if (error) {
          reject(error);
        }

        const list: string[] = [];
        for (const item of replies[0]) {
          list.push(Helpers.parseJson(item).username);
        }
        const response = {
          count: reply,
          names: list
        };
        resolve(response);
      });
    });
  });
}

export function getCommentsFromCache(key: string, start: number, end: number): Promise<ICommentDocument[]> {
  return new Promise((resolve, reject) => {
    client.lrange(`comments:${key}`, start, end, (err: Error | null, reply: string[]) => {
      if (err) {
        reject(err);
      }
      const list = [];
      for (const item of reply) {
        list.push(Helpers.parseJson(item));
      }
      resolve(list);
    });
  });
}

export function getReactionsFromCache(key: string, start: number, end: number): Promise<[IReactionDocument[], number]> {
  return new Promise((resolve, reject) => {
    if (!isNaN(start) && !isNaN(end)) {
      client.llen(`reactions:${key}`, (err: Error | null, reply: number) => {
        if (err) {
          reject(err);
        }
        const multi: Multi = client.multi();
        multi.lrange(`reactions:${key}`, start, end);
        multi.exec((error, replies) => {
          if (error) {
            reject(error);
          }
          const list: IReactionDocument[] = [];
          for (const item of replies[0]) {
            list.push(Helpers.parseJson(item));
          }
          if (replies[0].length) {
            resolve([list, reply]);
          } else {
            resolve([[], 0]);
          }
        });
      });
    }
  });
}

function updateReaction(
  multi: Multi,
  key: string,
  response: string[],
  reactionObject: IReactionObject,
  reaction?: IReactionDocument
): IReactionDocument | undefined {
  const { postId, previousReaction, username } = reactionObject;
  const list = [];
  for (const value of response) {
    list.push(Helpers.parseJson(value));
  }
  const result = _.find(list, (item) => {
    return item.postId === postId && item.type === previousReaction && item.username === username;
  });
  if (reaction && result?._id) {
    reaction._id = result?._id;
  }
  const index: number = _.findIndex(list, (item) => {
    return item.postId === postId && item.type === previousReaction && item.username === username;
  });
  multi.lrem(`reactions:${key}`, index, JSON.stringify(result));
  return reaction;
}

export { client as commentsCacheRedisClient };
