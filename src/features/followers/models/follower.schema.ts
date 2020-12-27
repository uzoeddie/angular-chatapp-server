import mongoose from 'mongoose';
import { IFollowerDocument } from '@followers/interface/followers.interface';

const folowerSchema: mongoose.Schema = new mongoose.Schema({
  followerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  followeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  createdAt: { type: Date, default: Date.now, index: true }
});

const FollowerModel: mongoose.Model<IFollowerDocument> = mongoose.model<IFollowerDocument>('Follower', folowerSchema, 'Follower');

export { FollowerModel };
