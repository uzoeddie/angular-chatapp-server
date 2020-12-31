import mongoose from 'mongoose';
export interface ICommentDocument extends mongoose.Document {
  _id?: mongoose.Types.ObjectId;
  username: string;
  avatarColor: string;
  postId: string;
  profilePicture: string;
  comment: string;
  createdAt?: Date;
  userTo?: mongoose.Types.ObjectId;
}
export interface IReactionDocument extends mongoose.Document {
  _id?: mongoose.Types.ObjectId;
  postId: string;
  type: string;
  username: string;
  profilePicture: string;
  avatarColor: string;
  createdAt: Date;
  userTo?: string;
}
export interface IRedisCommentList {
  count: number;
  names: string[];
}
export interface IFormattedReactions {
  type: string;
  value: number;
}
export interface IReactions {
  like: number;
  love: number;
  haha: number;
  wow: number;
  sad: number;
  angry: number;
}
