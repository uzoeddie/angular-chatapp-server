import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { reactionsSchema } from '@comments/schemes/comments';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { IReactionDocument } from '@comments/interface/comment.interface';
import { ObjectID } from 'mongodb';
import { savePostReactionToRedisCache } from '@redis/comments-cache';
import { reactionQueue } from '@queues/reaction.queue';

export class AddReaction {
  @joiValidation(reactionsSchema)
  public async reaction(req: Request, res: Response): Promise<void> {
    const { userTo, postId, type, previousReaction, profilePicture } = req.body;
    let reactionObJectId: ObjectID | null = null;
    if (!previousReaction) {
      reactionObJectId = new ObjectID();
    }
    const reactionObject: IReactionDocument = ({
      _id: reactionObJectId,
      postId,
      type,
      avatarColor: req.currentUser!.avatarColor!,
      username: req.currentUser!.username!,
      profilePicture
    } as unknown) as IReactionDocument;

    await savePostReactionToRedisCache(postId, JSON.stringify(reactionObject), previousReaction);
    const dbReactionData = {
      postId,
      userTo,
      userFrom: req.currentUser?.userId,
      username: req.currentUser?.username,
      type,
      previousReaction,
      reactionObject
    };
    reactionQueue.addReactionJob('addReactionToDB', dbReactionData);
    res.status(HTTP_STATUS.OK).json({ message: 'Like added to post successfully', notification: true });
  }
}
