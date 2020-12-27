import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { UpdateQuery } from 'mongoose';
import { ICommentDocument } from '@comments/interface/comment.interface';
import { CommentsModel } from '@comments/models/comment.schema';
import { addCommentSchema } from '@comments/schemes/comments';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { PostModel } from '@posts/models/post.schema';
import { postQueue } from '@queues/post.queue';
import { NotificationModel } from '@notifications/models/notification.schema';
import { getUserFromCache } from '@redis/user-cache';
import { IUserDocument } from '@user/interface/user.interface';
import { IPostDocument } from '@posts/interface/post.interface';
export class Add {
  @joiValidation(addCommentSchema)
  public async comment(req: Request, res: Response): Promise<void> {
    const comments: Promise<ICommentDocument> = CommentsModel.create({
      userTo: req.body.userTo,
      postId: req.body.postId,
      username: req.currentUser?.username as string,
      avatarColor: req.currentUser?.avatarColor as string,
      comment: req.body.comment,
      profilePicture: req.body.profilePicture
    });
    const posts: UpdateQuery<IPostDocument> = PostModel.updateOne({ _id: req.body.postId }, { $inc: { comments: 1 } });
    const user: Promise<IUserDocument> = getUserFromCache(req.body.userTo);
    const response: [ICommentDocument, UpdateQuery<IPostDocument>, IPostDocument, IUserDocument] = await Promise.all([
      comments,
      posts,
      PostModel.findOne({ _id: req.body.postId }).lean(),
      user
    ]);
    if (response[3].notifications.comments) {
      NotificationModel.schema.methods.insertNotification({
        userFrom: req.currentUser?.userId,
        userTo: req.body.userTo,
        message: `${req.currentUser?.username} commented on your post.`,
        notificationType: 'comment',
        entityId: req.body.postId,
        createdItemId: response[0]._id
      });
    }
    if (response) {
      postQueue.addPostJob('updateSinglePostInRedis', {
        type: 'comments',
        key: req.body.postId,
        value: `${response[2]?.comments}`,
        username: `${req.currentUser?.username}`
      });
    }

    res.status(HTTP_STATUS.OK).json({ message: 'Comment created successfully' });
  }
}
