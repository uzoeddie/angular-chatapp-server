import { IReactionDocument } from '@comments/interface/comment.interface';
import { ReactionsModel } from '@comments/models/reactions.schema';
import { IPostDocument } from '@posts/interface/post.interface';
import { PostModel } from '@posts/models/post.schema';
import { updateSinglePostPropInRedisCache } from '@redis/post-cache';
import { getUserFromCache } from '@redis/user-cache';
import { IUserDocument } from '@user/interface/user.interface';
import { UpdateQuery } from 'mongoose';
import { socketIONotificationObject } from '@sockets/notifications';
import { NotificationModel } from '@notifications/models/notification.schema';

class Reaction {
  public async addReactionDataToDB(reactionData: any): Promise<void> {
    const { postId, userTo, userFrom, username, type, previousReaction, reactionObject } = reactionData;
    if (previousReaction) {
      delete reactionObject._id;
    }
    const updatedReaction: [IUserDocument, UpdateQuery<IReactionDocument>, UpdateQuery<IPostDocument>] = (await Promise.all([
      getUserFromCache(userTo),
      ReactionsModel.replaceOne({ postId, type: previousReaction, username: username }, reactionObject, { upsert: true }),
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
    const data = (updatedReaction[2].reactions as unknown) as string;
    await updateSinglePostPropInRedisCache(postId, 'reactions', data);
    if (updatedReaction[0].notifications.reactions && userFrom !== userTo) {
      const notifications = await NotificationModel.schema.methods.insertNotification({
        userFrom,
        userTo,
        message: `${username} reacted to your post.`,
        notificationType: 'reactions',
        entityId: postId,
        createdItemId: updatedReaction[1]._id
      });
      socketIONotificationObject.emit('insert notification', notifications, { userTo });
    }
  }

  public async removeReactionFromDB(reactionData: any): Promise<void> {
    const { postId, previousReaction, username } = reactionData;
    const updatedReaction: [this, UpdateQuery<IPostDocument>] = (await Promise.all([
      ReactionsModel.deleteOne({
        postId,
        type: previousReaction,
        username
      }),
      PostModel.findOneAndUpdate(
        { _id: postId },
        {
          $inc: {
            [`reactions.${previousReaction}`]: -1
          }
        },
        { new: true }
      )
    ])) as [this, UpdateQuery<IPostDocument>];
    const data = (updatedReaction[1].reactions as unknown) as string;
    await updateSinglePostPropInRedisCache(postId, 'reactions', data);
  }
}

export const reactionService: Reaction = new Reaction();