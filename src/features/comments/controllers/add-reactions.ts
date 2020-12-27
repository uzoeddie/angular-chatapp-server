import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ReactionsModel } from '@comments/models/reactions.schema';
import { reactionsSchema } from '@comments/schemes/comments';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { PostModel } from '@posts/models/post.schema';
import { postQueue } from '@queues/post.queue';
import { getUserFromCache } from '@redis/user-cache';
import { NotificationModel } from '@notifications/models/notification.schema';
import { IReactionDocument } from '@comments/interface/comment.interface';
import { IUserDocument } from '@user/interface/user.interface';
import { UpdateQuery } from 'mongoose';
import { IPostDocument } from '@posts/interface/post.interface';

export class AddReaction {
  @joiValidation(reactionsSchema)
  public async reaction(req: Request, res: Response): Promise<void> {
    const { userTo, postId, type, previousReaction } = req.body;
    const reactionObject: IReactionDocument = {
      userTo,
      postId,
      type,
      avatarColor: req.currentUser!.avatarColor!,
      username: req.currentUser!.username!,
      profilePicture: req.body.profilePicture
    } as IReactionDocument;

    const updatedReaction: [
      IUserDocument,
      this,
      IReactionDocument,
      UpdateQuery<IPostDocument>,
      UpdateQuery<IPostDocument>,
      IPostDocument
    ] = (await Promise.all([
      getUserFromCache(req.body.userTo),
      ReactionsModel.deleteOne({ postId, type: previousReaction, username: req.currentUser?.username }),
      ReactionsModel.create(reactionObject),
      PostModel.updateOne({ _id: postId }, { $inc: { [`reactions.${previousReaction}`]: -1 } }),
      PostModel.updateOne({ _id: postId }, { $inc: { [`reactions.${type}`]: 1 } }),
      PostModel.findOne({ _id: postId }).lean()
    ])) as [IUserDocument, this, IReactionDocument, UpdateQuery<IPostDocument>, UpdateQuery<IPostDocument>, IPostDocument];

    if (updatedReaction[0].notifications.reactions) {
      NotificationModel.schema.methods.insertNotification({
        userFrom: req.currentUser?.userId,
        userTo,
        message: `${req.currentUser?.username} reacted to your post.`,
        notificationType: 'reactions',
        entityId: postId,
        createdItemId: updatedReaction[2]._id
      });
    }

    if (updatedReaction) {
      postQueue.addPostJob('updateSinglePostInRedis', { type: 'reactions', key: postId, value: updatedReaction[5]?.reactions });
    }
    res.status(HTTP_STATUS.OK).json({ message: 'Like added to post successfully', notification: true });
  }
}
