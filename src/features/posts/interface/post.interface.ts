import { IFormattedReactions } from '@comments/interface/comment.interface';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

interface IFeeling {
  name: string;
  file: string;
}

export type PostPrivacyType = 'Public' | 'Followers' | 'Private';
export interface IPostPrivacy {
  type: PostPrivacyType;
  iconName: string;
}
export interface ILike {
  id: string;
  postId: string;
  type: string;
}
export interface ICreatePost {
  id?: mongoose.Types.ObjectId;
  userId?: string;
  email?: string;
  username?: string;
  avatarColor?: string;
  profilePicture: string;
  post?: string;
  image?: string;
  bgColor?: string;
  feelings?: IFeeling;
  privacy?: IPostPrivacy | string;
  gifUrl?: string;
  imgId?: string;
  imgVersion?: string;
  createdAt?: Date;
}
export interface IPostDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  userId: string;
  email: string;
  username: string;
  avatarColor: string;
  profilePicture: string;
  post: string;
  bgColor: string;
  comments: number;
  imgVersion?: string;
  imgId?: string;
  feelings?: IFeeling;
  privacy?: IPostPrivacy;
  gifUrl?: string;
  reactions?: IReactions | IFormattedReactions[];
  createdAt?: Date;
}
export interface IReactions {
  like: number;
  love: number;
  haha: number;
  wow: number;
  sad: number;
  angry: number;
}

export interface IPostJobData {
  type?: string;
  key?: string | ObjectId | undefined;
  value?: string | IPostDocument | number | IFormattedReactions[] | IReactions;
  username?: string;
  uId?: string | number;
  prop?: string;
}
