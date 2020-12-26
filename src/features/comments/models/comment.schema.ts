import mongoose from 'mongoose';
import { ICommentDocument } from '@comments/interface/comment.interface';

const commentSchema: mongoose.Schema = new mongoose.Schema({
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', index: true},
    comment: { type: String, default: '' },
    username: { type: String, default: '' },
    profilePicture: { type: String, default: '' },
    avatarColor: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
});

const CommentsModel: mongoose.Model<ICommentDocument> = mongoose.model<ICommentDocument>('Comment', commentSchema, 'Comment');

export { CommentsModel };
