import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { commentCache } from '@redis/comments-cache';
import { socketIOPostObject } from '@sockets/posts';
import { reactionQueue } from '@queues/reaction.queue';
import { IReactionJob } from '@comments/interface/comment.interface';

export class Remove {
  public async reaction(req: Request, res: Response): Promise<void> {
    const { postId, previousReaction } = req.params;
    await commentCache.removeReactionFromCache(postId, previousReaction, req.currentUser!.username);
    socketIOPostObject.emit('remove reaction', {
      postId,
      previousReaction,
      username: req.currentUser!.username
    });
    const dbReactionData: IReactionJob = {
      postId,
      previousReaction,
      username: req.currentUser!.username
    };
    reactionQueue.addReactionJob('removeReactionFromDB', dbReactionData);
    res.status(HTTP_STATUS.OK).json({ message: 'Reaction removed from post' });
  }
}
