import { Response } from 'express';
import { AuthPayload } from '@user/interface/user.interface';
import { IJwt } from './auth.mock';
import { ICommentDocument, IReactionDocument, IRedisCommentList } from '@comments/interface/comment.interface';

export const commentMockRequest = (sessionData: IJwt, body: IBody, currentUser?: AuthPayload | null, params?: IParams) => ({
  session: sessionData,
  body,
  params,
  currentUser
});

export const commentMockResponse = (): Response => {
  const res: Response = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

export interface IBody {
  postId?: string;
  comment?: string;
  profilePicture?: string;
  userTo?: string;
  type?: string;
  previousReaction?: string;
}

export interface IParams {
  postId?: string;
  page?: string;
  commentId?: string;
  reactionId?: string;
  previousReaction?: string;
}

export const commentsData: ICommentDocument = {
  _id: '6064861bc25eaa5a5d2f9bf4',
  username: 'Danny',
  avatarColor: '#9c27b0',
  postId: '6027f77087c9d9ccb1555268',
  profilePicture: 'https://res.cloudinary.com/ratingapp/image/upload/6064793b091bf02b6a71067a',
  comment: 'This is a comment',
  createdAt: new Date(),
  userTo: '60263f14648fed5246e322d9'
} as ICommentDocument;

export const redisCommentList: IRedisCommentList = {
  count: 1,
  names: ['Danny']
};

export const reactionData: IReactionDocument = {
  _id: '6064861bc25eaa5a5d2f9bf4',
  username: 'Danny',
  postId: '6027f77087c9d9ccb1555268',
  profilePicture: 'https://res.cloudinary.com/ratingapp/image/upload/6064793b091bf02b6a71067a',
  comment: 'This is a comment',
  createdAt: new Date(),
  userTo: '60263f14648fed5246e322d9',
  type: 'love'
} as IReactionDocument;
