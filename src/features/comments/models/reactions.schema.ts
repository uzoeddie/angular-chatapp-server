import mongoose, { model, Model } from 'mongoose';
import { IReactionDocument } from '@comments/interface/comment.interface';

const reactionSchema: mongoose.Schema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', index: true },
  type: { type: String, default: '', index: true },
  username: { type: String, default: '', index: true },
  avatarColor: { type: String, default: '' },
  profilePicture: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const ReactionsModel: Model<IReactionDocument> = model<IReactionDocument>('Reaction', reactionSchema, 'Reaction');

export { ReactionsModel };
