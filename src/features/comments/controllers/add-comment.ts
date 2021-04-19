import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ICommentDocument, ICommentJob } from '@comments/interface/comment.interface';
import { addCommentSchema } from '@comments/schemes/comments';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { ObjectID } from 'mongodb';
import { commentCache } from '@redis/comments-cache';
import { commentQueue } from '@queues/comment.queue';

export class Add {
  @joiValidation(addCommentSchema)
  public async comment(req: Request, res: Response): Promise<void> {
    const commentObJectId: ObjectID = new ObjectID();
    const commentData: ICommentDocument = ({
      _id: commentObJectId,
      postId: req.body.postId,
      username: req.currentUser?.username as string,
      avatarColor: req.currentUser?.avatarColor as string,
      comment: req.body.comment,
      profilePicture: req.body.profilePicture,
      createdAt: new Date()
    } as unknown) as ICommentDocument;
    await commentCache.savePostCommentToRedisCache(req.body.postId, JSON.stringify(commentData));
    const dbCommentData: ICommentJob = {
      postId: req.body.postId,
      userTo: req.body.userTo,
      userFrom: req.currentUser!.userId,
      username: req.currentUser!.username,
      comment: commentData
    };
    commentQueue.addCommentJob('addCommentToDB', dbCommentData);

    res.status(HTTP_STATUS.OK).json({ message: 'Comment created successfully' });
  }
}
