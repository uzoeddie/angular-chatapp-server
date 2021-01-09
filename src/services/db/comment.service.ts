import { ICommentDocument, IReactionDocument } from '@comments/interface/comment.interface';
import { CommentsModel } from '@comments/models/comment.schema';
import { ReactionsModel } from '@comments/models/reactions.schema';
import { NotificationModel } from '@notifications/models/notification.schema';
import { IPostDocument } from '@posts/interface/post.interface';
import { PostModel } from '@posts/models/post.schema';
import { updateSinglePostPropInRedisCache } from '@redis/post-cache';
import { getUserFromCache } from '@redis/user-cache';
import { IUserDocument } from '@user/interface/user.interface';
import { UpdateQuery } from 'mongoose';
import mongoose from 'mongoose';
import { socketIONotificationObject } from '@sockets/notifications';

class Comment {
  public async addCommentToDB(commentData: any): Promise<void> {
    const { postId, userTo, userFrom, username, comment } = commentData;
    const comments: Promise<ICommentDocument> = CommentsModel.create(comment);
    const posts: UpdateQuery<IPostDocument> = PostModel.findOneAndUpdate({ _id: postId }, { $inc: { comments: 1 } }, { new: true });
    const user: Promise<IUserDocument> = getUserFromCache(userTo);
    const response: [ICommentDocument, UpdateQuery<IPostDocument>, IUserDocument] = await Promise.all([comments, posts, user]);
    await updateSinglePostPropInRedisCache(postId, 'comments', `${response[1].comments}`);
    if (response[2].notifications.comments && userFrom !== userTo) {
      NotificationModel.schema.methods.insertNotification({
        userFrom,
        userTo,
        message: `${username} commented on your post.`,
        notificationType: 'comment',
        entityId: postId,
        createdItemId: response[0]._id
      });
      const notifications = NotificationModel.find({ userTo })
        .lean()
        .populate({
          path: 'userFrom',
          select: 'username avatarColor uId profilePicture'
        })
        .sort({ date: -1 });
      socketIONotificationObject.emit('insert notification', notifications, { userTo });
    }
  }

  public async addReactionDataToDB(reactionData: any): Promise<void> {
    const { postId, userTo, userFrom, username, type, previousReaction, reactionObject } = reactionData;
    if (previousReaction) {
      delete reactionObject._id;
    }
    const updatedReaction: [IUserDocument, UpdateQuery<IReactionDocument>, UpdateQuery<IPostDocument>] = (await Promise.all([
      getUserFromCache(userTo),
      ReactionsModel.replaceOne({ postId: mongoose.Types.ObjectId(postId), type: previousReaction, username: username }, reactionObject, { upsert: true }),
      PostModel.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId(postId) },
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
    if (updatedReaction[0].notifications.reactions && userTo !== userFrom) {
      NotificationModel.schema.methods.insertNotification({
        userFrom,
        userTo,
        message: `${username} reacted to your post.`,
        notificationType: 'reactions',
        entityId: postId,
        createdItemId: updatedReaction[1]._id
      });
      const notifications = NotificationModel.find({ userTo })
        .lean()
        .populate({
          path: 'userFrom',
          select: 'username avatarColor uId profilePicture'
        })
        .sort({ date: -1 });
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

export const commentService: Comment = new Comment();
