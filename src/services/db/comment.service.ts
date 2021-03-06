/* eslint-disable @typescript-eslint/no-explicit-any */
import { ICommentDocument } from '@comments/interface/comment.interface';
import { CommentsModel } from '@comments/models/comment.schema';
import { NotificationModel } from '@notifications/models/notification.schema';
import { IPostDocument } from '@posts/interface/post.interface';
import { PostModel } from '@posts/models/post.schema';
import { postCache } from '@redis/post-cache';
import { userCache } from '@redis/user-cache';
import { IUserDocument } from '@user/interface/user.interface';
import { UpdateQuery } from 'mongoose';
import { socketIONotificationObject } from '@sockets/notifications';
import { INotificationDocument } from '@notifications/interface/notification.interface';
import { emailQueue } from '@queues/email.queue';
import { notificationTemplate } from '@email/templates/notification/notification-template';

class Comment {
  public async addCommentToDB(commentData: any): Promise<void> {
    const { postId, userTo, userFrom, username, comment } = commentData;
    const comments: Promise<ICommentDocument> = CommentsModel.create(comment);
    const posts: UpdateQuery<IPostDocument> = PostModel.findOneAndUpdate({ _id: postId }, { $inc: { comments: 1 } }, { new: true });
    const user: Promise<IUserDocument> = userCache.getUserFromCache(userTo);
    const response: [ICommentDocument, UpdateQuery<IPostDocument>, IUserDocument] = await Promise.all([comments, posts, user]);
    await postCache.updateSinglePostPropInRedisCache(postId, 'comments', `${response[1].comments}`);
    if (userFrom !== userTo) {
      const notificationModel: INotificationDocument = new NotificationModel();
      const notifications: void = await notificationModel.insertNotification({
        userFrom,
        userTo,
        message: `${username} commented on your post.`,
        notificationType: 'comment',
        entityId: postId,
        createdItemId: response[0]._id!
      });
      socketIONotificationObject.emit('insert notification', notifications, { userTo });
    }

    if (response[2].notifications.comments) {
      const templateParams = {
        username: response[2].username,
        message: `${response[1].comments}`,
        header: 'Comments Notification'
      };
      const template: string = notificationTemplate.notificationMessageTemplate(templateParams);
      emailQueue.addEmailJob('commentsMail', { receiverEmail: response[2].email, template, type: `${username} commented on your post.` });
    }
  }
}

export const commentService: Comment = new Comment();
