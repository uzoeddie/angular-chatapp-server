import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { commentQueue } from '@queues/comment.queue';
import { removeReactionFromCache } from '@redis/comments-cache';
import { socketIOPostObject } from '@sockets/posts';

export class Remove {
  public async reaction(req: Request, res: Response): Promise<void> {
    const { postId, previousReaction } = req.params;
    await removeReactionFromCache(postId, previousReaction, req.currentUser!.username);
    socketIOPostObject.emit('remove reaction', {
      postId,
      previousReaction,
      username: req.currentUser!.username
    });
    const dbReactionData = {
      postId,
      previousReaction,
      username: req.currentUser?.username
    };
    commentQueue.addCommentJob('removeReactionFromDB', dbReactionData);
    res.status(HTTP_STATUS.OK).json({ message: 'Reaction removed from post' });
  }
}
