import { Response } from 'express';
import { AuthPayload } from '@user/interface/user.interface';
import { IJwt } from './auth.mock';
import { IFollower, IFollowerDocument } from '@followers/interface/followers.interface';
import mongoose from 'mongoose';

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

export const followerData: IFollower = {
  _id: '605727cd646cb50e668a4e13',
  followerId: {
    username: 'Manny',
    postCount: 5,
    avatarColor: '#ff9800',
    followersCount: 3,
    followingCount: 5,
    profilePicture: 'https://res.cloudinary.com/ratingapp/image/upload/605727cd646eb50e668a4e13'
  },
  followeeId: {
    username: 'Danny',
    postCount: 10,
    avatarColor: '#ff9800',
    followersCount: 3,
    followingCount: 5,
    profilePicture: 'https://res.cloudinary.com/ratingapp/image/upload/605727cd646eb50e668a4e13'
  }
};

export const followerDocument: IFollowerDocument = {
  _id: mongoose.Types.ObjectId('605727cd646cb50e668a4e13'),
  followerId: mongoose.Types.ObjectId('605727cd646cb50e668a4e13'),
  followeeId: mongoose.Types.ObjectId('605727cd646cb50e668a4e14')
} as IFollowerDocument;
