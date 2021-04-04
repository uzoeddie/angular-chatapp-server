import mongoose from 'mongoose';
export interface ICommentDocument extends mongoose.Document {
  _id?: mongoose.Types.ObjectId | string;
  username: string;
  avatarColor: string;
  postId: string;
  profilePicture: string;
  comment: string;
  createdAt?: Date;
  userTo?: mongoose.Types.ObjectId | string;
}
export interface IReactionDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId | string | null;
  postId: string | mongoose.Types.ObjectId;
  type: string;
  username: string;
  profilePicture: string;
  avatarColor: string;
  createdAt?: Date;
  userTo?: string;
  comment?: string;
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

export interface IReactionObject {
  postId: string | mongoose.Types.ObjectId;
  previousReaction: string;
  username: string;
}

export interface ICommentJob {
  postId: string;
  userTo: string;
  userFrom: string;
  username: string;
  comment: ICommentDocument;
}

export interface IReactionJob {
  postId: string;
  username: string;
  previousReaction: string;
  userTo?: string;
  userFrom?: string;
  type?: string;
  reactionObject?: IReactionDocument;
}
