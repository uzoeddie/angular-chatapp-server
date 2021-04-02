/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import redis, { RedisClient } from 'redis-mock';
import { authUserPayload } from '@root/mocks/auth.mock';
import { commentMockRequest, commentMockResponse, commentsData, reactionData, redisCommentList } from '@mock/comment.mock';
import * as cache from '@redis/comments-cache';
import { Helpers } from '@global/helpers';
import { GetPost } from '@comments/controllers/get-comments';

jest.useFakeTimers();
jest.mock('@queues/reaction.queue');
jest.mock('@redis/comments-cache');
jest.mock('@global/helpers');

describe('GetPost', () => {
  let client: RedisClient;
  beforeEach(() => {
    jest.restoreAllMocks();
    client = redis.createClient();
  });

  afterEach((done) => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    client.flushall(done);
    client.quit(done);
  });

  describe('comments', () => {
    it('should send correct json response if comments exist in cache', async () => {
      const req: Request = commentMockRequest({}, {}, authUserPayload, {
        postId: '6027f77087c9d9ccb1555268',
        page: '1'
      }) as Request;
      const res: Response = commentMockResponse();
      jest.spyOn(cache, 'getCommentsFromCache').mockImplementation((): any => [commentsData]);

      await GetPost.prototype.comments(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post comments',
        comments: [commentsData]
      });
    });

    it('should send correct json response if comments exist in database', async () => {
      const req: Request = commentMockRequest({}, {}, authUserPayload, {
        postId: '6027f77087c9d9ccb1555268',
        page: '1'
      }) as Request;
      const res: Response = commentMockResponse();
      jest.spyOn(cache, 'getCommentsFromCache').mockImplementation((): any => []);
      jest.spyOn(Helpers, 'getPostComments').mockImplementation(() => Promise.resolve([commentsData]));

      await GetPost.prototype.comments(req, res);
      expect(Helpers.getPostComments).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post comments',
        comments: [commentsData]
      });
    });
  });

  describe('commentsFromCache', () => {
    it('should send correct json response', async () => {
      const req: Request = commentMockRequest({}, {}, authUserPayload, {
        postId: '6027f77087c9d9ccb1555268'
      }) as Request;
      const res: Response = commentMockResponse();
      jest.spyOn(cache, 'getCommentNamesFromCache').mockImplementation((): any => redisCommentList);

      await GetPost.prototype.commentsFromCache(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post comments names',
        comments: redisCommentList
      });
    });
  });

  describe('reactions', () => {
    it('should send correct json response if reactions exist in cache', async () => {
      const req: Request = commentMockRequest({}, {}, authUserPayload, {
        postId: '6027f77087c9d9ccb1555268',
        page: '1'
      }) as Request;
      const res: Response = commentMockResponse();
      jest.spyOn(cache, 'getReactionsFromCache').mockImplementation((): any => [[reactionData], 1]);

      await GetPost.prototype.reactions(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post reactions',
        reactions: [reactionData],
        count: 1
      });
    });

    it('should send correct json response if reactions exist in database', async () => {
      const req: Request = commentMockRequest({}, {}, authUserPayload, {
        postId: '6027f77087c9d9ccb1555268',
        page: '1'
      }) as Request;
      const res: Response = commentMockResponse();
      jest.spyOn(cache, 'getReactionsFromCache').mockImplementation((): any => [[]]);
      jest.spyOn(Helpers, 'getPostReactions').mockImplementation(() => Promise.resolve([[reactionData], 1]));

      await GetPost.prototype.reactions(req, res);
      expect(Helpers.getPostReactions).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post reactions',
        reactions: [reactionData],
        count: 1
      });
    });
  });

  describe('singleComment', () => {
    it('should send correct json response', async () => {
      const req: Request = commentMockRequest({}, {}, authUserPayload, {
        commentId: '6064861bc25eaa5a5d2f9bf4'
      }) as Request;
      const res: Response = commentMockResponse();
      jest.spyOn(Helpers, 'getPostComments').mockImplementation(() => Promise.resolve([commentsData]));

      await GetPost.prototype.singleComment(req, res);
      expect(Helpers.getPostComments).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Single comment',
        comment: commentsData
      });
    });
  });

  describe('singleReaction', () => {
    it('should send correct json response', async () => {
      const req: Request = commentMockRequest({}, {}, authUserPayload, {
        reactionId: '6064861bc25eaa5a5d2f9bf4'
      }) as Request;
      const res: Response = commentMockResponse();
      jest.spyOn(Helpers, 'getPostReactions').mockImplementation(() => Promise.resolve([[reactionData], 1]));

      await GetPost.prototype.singleReaction(req, res);
      expect(Helpers.getPostReactions).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Single post reaction',
        reactions: [reactionData],
        count: 1
      });
    });
  });
});
