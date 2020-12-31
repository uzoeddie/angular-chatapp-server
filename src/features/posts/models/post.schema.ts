import mongoose from 'mongoose';
import autopopulate from 'mongoose-autopopulate';
import { Helpers } from '@global/helpers';
import { IPostDocument } from '@posts/interface/post.interface';

const postSchema: mongoose.Schema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, index: true },
    username: { type: String },
    email: { type: String },
    avatarColor: { type: String },
    profilePicture: { type: String, default: '' },
    post: { type: String, default: '' },
    bgColor: { type: String, default: '' },
    imgVersion: { type: String, default: '' },
    imgId: { type: String, default: '' },
    feelings: { type: Object, default: {} },
    gifUrl: { type: String, default: '' },
    privacy: { type: Object },
    comments: { type: Number, default: 0 },
    reactions: {
      like: { type: Number, default: 0 },
      love: { type: Number, default: 0 },
      haha: { type: Number, default: 0 },
      wow: { type: Number, default: 0 },
      sad: { type: Number, default: 0 },
      angry: { type: Number, default: 0 }
    },
    createdAt: { type: Date, default: Date.now, index: true }
  },
  {
    minimize: false,
    toObject: {
      transform(_doc, ret) {
        ret.reactions = Helpers.formattedReactions(ret.reactions);
        return ret;
      }
    }
  }
);

postSchema.plugin(autopopulate);
const PostModel: mongoose.Model<IPostDocument> = mongoose.model<IPostDocument>('Post', postSchema, 'Post');

export { PostModel };
