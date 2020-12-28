import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ReactionsModel } from '@comments/models/reactions.schema';
import { PostModel } from '@posts/models/post.schema';
import { postQueue } from '@queues/post.queue';
import { IPostDocument } from '@posts/interface/post.interface';
import { UpdateQuery } from 'mongoose';

export class Remove {
  public async reaction(req: Request, res: Response): Promise<void> {
    const { postId, previousReaction } = req.params;
    const updatedReaction: [this, UpdateQuery<IPostDocument>] = (await Promise.all([ReactionsModel.deleteOne({ postId, type: previousReaction, username: req.currentUser?.username }), PostModel.findOneAndUpdate({ _id: postId }, { $inc: { [`reactions.${previousReaction}`]: -1 } }, { new: true })])) as [this, UpdateQuery<IPostDocument>];

    if (updatedReaction) {
      postQueue.addPostJob('updateSinglePostInRedis', { type: 'reactions', key: postId, value: updatedReaction[1]?.reactions });
    }
    res.status(HTTP_STATUS.OK).json({ message: 'Reaction removed from post' });
  }
}
