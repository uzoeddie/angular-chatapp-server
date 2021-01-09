import { IUserBirthDay } from '@user/interface/user.interface';
import mongoose from 'mongoose';

export interface IFollowing {
  userId: string;
}

export interface IFollowers {
  userId: string;
}

export interface IFollowerDocument extends mongoose.Document {
  followerId: mongoose.Types.ObjectId;
  followeeId: mongoose.Types.ObjectId;
  createdAt?: Date;
}

export interface IFollower {
  _id: mongoose.Types.ObjectId | string;
  followeeId: IFollowerData;
  followerId: IFollowerData;
  createdAt?: Date;
}

export interface IFollowerData {
  avatarColor: string;
  followersCount: number;
  followingCount: number;
  profilePicture: string;
  postCount: number;
  username: string;
  _id?: mongoose.Types.ObjectId | string;
  birthDay?: IUserBirthDay;
}

export interface IFollowerJobData {
  key: string;
  value: string;
}
