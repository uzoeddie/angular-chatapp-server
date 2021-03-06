import redis, { RedisClient } from 'redis-mock';
import { commentCache } from '@redis/comments-cache';
import { commentsData, reactionData } from '@mock/comment.mock';

jest.useFakeTimers();

describe('CommentsCache', () => {
  let client: RedisClient;
  beforeEach(() => {
    jest.restoreAllMocks();
    client = redis.createClient({ host: '127.0.0.1', port: 6379 });
  });

  afterEach((done) => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    client.flushall(done);
    client.quit(done);
  });

  afterAll((done) => {
    done();
  });

  describe('savePostCommentToRedisCache', () => {
    it('should add comment', async () => {
      await expect(
        commentCache.savePostCommentToRedisCache('6027f77087c9d9ccb1555268', JSON.stringify(commentsData))
      ).resolves.toBeUndefined();
    });
  });

  describe('savePostReactionToRedisCache', () => {
    it('should add reaction', async () => {
      await expect(
        commentCache.savePostReactionToRedisCache('6027f77087c9d9ccb1555268', JSON.stringify(reactionData), 'like')
      ).resolves.toBeUndefined();
    });
  });

  describe('removeReactionFromCache', () => {
    it('should remove a reaction', async () => {
      await commentCache.savePostReactionToRedisCache('6027f77087c9d9ccb1555268', JSON.stringify(reactionData), 'like');
      await expect(commentCache.removeReactionFromCache('6027f77087c9d9ccb1555268', 'love', 'Danny')).resolves.toBeUndefined();
    });
  });

  describe('getCommentNamesFromCache', () => {
    it('should get comment user names', async () => {
      await commentCache.savePostCommentToRedisCache('6027f77087c9d9ccb1555268', JSON.stringify(commentsData));
      await expect(commentCache.getCommentNamesFromCache('6027f77087c9d9ccb1555268')).resolves.toEqual({ count: 1, names: ['Danny'] });
    });
  });

  describe('getCommentNamesFromCache', () => {
    it('should get comments', async () => {
      await commentCache.savePostCommentToRedisCache('6027f77087c9d9ccb1555268', JSON.stringify(commentsData));
      commentsData.createdAt = JSON.parse(JSON.stringify(new Date(commentsData.createdAt!)));
      await expect(commentCache.getCommentsFromCache('6027f77087c9d9ccb1555268', 0, 1)).resolves.toStrictEqual([commentsData]);
    });
  });

  describe('getReactionsFromCache', () => {
    it('should get reactions', async () => {
      await commentCache.savePostReactionToRedisCache('6027f77087c9d9ccb1555268', JSON.stringify(reactionData), 'like');
      reactionData.createdAt = JSON.parse(JSON.stringify(new Date(reactionData.createdAt!)));
      await expect(commentCache.getReactionsFromCache('6027f77087c9d9ccb1555268', 0, 1)).resolves.toStrictEqual([[reactionData], 1]);
    });
  });
});
