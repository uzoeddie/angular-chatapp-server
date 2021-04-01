import { Response } from 'express';
import { AuthPayload } from '@user/interface/user.interface';
import { IJwt } from './auth.mock';

export const followersMockRequest = (sessionData: IJwt, currentUser?: AuthPayload | null, params?: IParams) => ({
  session: sessionData,
  params,
  currentUser
});

export const followersMockResponse = (): Response => {
  const res: Response = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

export interface IParams {
  followerId?: string;
  userId?: string;
}
