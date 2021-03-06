import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { postCache } from '@redis/post-cache';
import { socketIOPostObject } from '@sockets/posts';
import { postQueue } from '@queues/post.queue';

export class Delete {
  public async post(req: Request, res: Response): Promise<void> {
    await postCache.deletePostFromCache(req.params.postId, `${req.currentUser?.userId}`);
    socketIOPostObject.emit('delete message', req.params.postId);
    postQueue.addPostJob('deletePostFromDB', { keyOne: req.params.postId, keyTwo: req.currentUser?.userId });
    res.status(HTTP_STATUS.OK).json({ message: 'Post deleted successfully', notification: true });
  }
}
