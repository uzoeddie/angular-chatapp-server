import { ICommentDocument } from '@comments/interface/comment.interface';
import { CommentsModel } from '@comments/models/comment.schema';
import { NotificationModel } from '@notifications/models/notification.schema';
import { IPostDocument } from '@posts/interface/post.interface';
import { PostModel } from '@posts/models/post.schema';
import { updateSinglePostPropInRedisCache } from '@redis/post-cache';
import { getUserFromCache } from '@redis/user-cache';
import { IUserDocument } from '@user/interface/user.interface';
import { UpdateQuery } from 'mongoose';
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
      const notifications = await NotificationModel.schema.methods.insertNotification({
        userFrom,
        userTo,
        message: `${username} commented on your post.`,
        notificationType: 'comment',
        entityId: postId,
        createdItemId: response[0]._id
      });
      socketIONotificationObject.emit('insert notification', notifications, { userTo });
    }
  }
}

export const commentService: Comment = new Comment();
