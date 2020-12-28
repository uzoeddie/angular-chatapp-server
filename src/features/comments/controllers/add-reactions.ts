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

    const updatedReaction: [IUserDocument, UpdateQuery<IReactionDocument>, UpdateQuery<IPostDocument>] = (await Promise.all([
      getUserFromCache(req.body.userTo),
      ReactionsModel.replaceOne({ postId, type: previousReaction, username: req.currentUser?.username }, reactionObject, { upsert: true }),
      PostModel.findOneAndUpdate(
        { _id: postId },
        {
          $inc: {
            [`reactions.${previousReaction}`]: -1,
            [`reactions.${type}`]: 1
          }
        },
        { new: true }
      )
    ])) as [IUserDocument, UpdateQuery<IReactionDocument>, UpdateQuery<IPostDocument>];

    if (updatedReaction[0].notifications.reactions) {
      NotificationModel.schema.methods.insertNotification({
        userFrom: req.currentUser?.userId,
        userTo,
        message: `${req.currentUser?.username} reacted to your post.`,
        notificationType: 'reactions',
        entityId: postId,
        createdItemId: updatedReaction[1]._id
      });
    }

    if (updatedReaction) {
      postQueue.addPostJob('updateSinglePostInRedis', { type: 'reactions', key: postId, value: updatedReaction[2]?.reactions });
    }
    res.status(HTTP_STATUS.OK).json({ message: 'Like added to post successfully', notification: true });
  }
}
