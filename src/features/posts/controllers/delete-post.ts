import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { CommentsModel } from '@comments/models/comment.schema';
import { ReactionsModel } from '@comments/models/reactions.schema';
import { PostModel } from '@posts/models/post.schema';
import { deletePostFromCache } from '@redis/post-cache';
import { UserModel } from '@user/models/user.schema';
import { UpdateQuery } from 'mongoose';
import { IUserDocument } from '@user/interface/user.interface';

export class Delete {
  public async post(req: Request, res: Response): Promise<void> {
    const deletPost: Promise<this> = PostModel.deleteOne({ _id: req.params.postId });
    const decrementPostNumber: UpdateQuery<IUserDocument> = UserModel.updateOne({ _id: req.currentUser?.userId }, { $inc: { postCount: -1 } });
    const deleteComments: Promise<this> = CommentsModel.deleteMany({ postId: req.params.postId });
    const deleteReactions: Promise<this> = ReactionsModel.deleteMany({ postId: req.params.postId });
    const deleteFromCache: Promise<void> = deletePostFromCache(req.params.postId);

    await Promise.all([deletPost, decrementPostNumber, deleteComments, deleteReactions, deleteFromCache]);
    res.status(HTTP_STATUS.OK).json({ message: 'Post deleted successfully' });
  }
}
