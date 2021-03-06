import _ from 'lodash';
import { Multi } from 'redis';
import { ICommentDocument, IReactionDocument, IReactionObject, IRedisCommentList } from '@comments/interface/comment.interface';
import { Helpers } from '@global/helpers';
import { BaseCache } from '@redis/base.cache';
class CommentCache extends BaseCache {
  constructor() {
    super('commentsCache');
  }

  public savePostCommentToRedisCache(key: string, value: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.lpush(`comments:${key}`, value, (error: Error | null) => {
        if (error) {
          reject(error);
        }
        resolve();
      });
    });
  }

  public savePostReactionToRedisCache(key: string, value: string, previousReaction?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const multi: Multi = this.client.multi();
      let reaction: IReactionDocument | undefined = Helpers.parseJson(value);
      this.client.lrange(`reactions:${key}`, 0, -1, (error: Error | null, response: string[]) => {
        if (error) {
          reject(error);
        }
        if (previousReaction) {
          const reactionObject: IReactionObject = {
            postId: reaction!.postId,
            previousReaction,
            username: reaction!.username
          };
          reaction = this.updateReaction(multi, key, response, reactionObject, reaction);
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

  public removeReactionFromCache(key: string, previousReaction: string, username: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const multi: Multi = this.client.multi();
      this.client.lrange(`reactions:${key}`, 0, -1, (error: Error | null, response: string[]) => {
        if (error) {
          reject(error);
        }
        const reactionObject: IReactionObject = {
          postId: key,
          previousReaction,
          username
        };
        this.updateReaction(multi, key, response, reactionObject);
        multi.exec((error: Error | null) => {
          if (error) {
            reject(error);
          }
          resolve();
        });
      });
    });
  }

  public getCommentNamesFromCache(key: string): Promise<IRedisCommentList> {
    return new Promise((resolve, reject) => {
      this.client.llen(`comments:${key}`, (err: Error | null, reply: number) => {
        if (err) {
          reject(err);
        }
        const multi: Multi = this.client.multi();
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

  public getCommentsFromCache(key: string, start: number, end: number): Promise<ICommentDocument[]> {
    return new Promise((resolve, reject) => {
      this.client.lrange(`comments:${key}`, start, end, (err: Error | null, reply: string[]) => {
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

  public getReactionsFromCache(key: string, start: number, end: number): Promise<[IReactionDocument[], number]> {
    return new Promise((resolve, reject) => {
      if (!isNaN(start) && !isNaN(end)) {
        this.client.llen(`reactions:${key}`, (err: Error | null, reply: number) => {
          if (err) {
            reject(err);
          }
          const multi: Multi = this.client.multi();
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

  private updateReaction(
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
}

export const commentCache: CommentCache = new CommentCache();
