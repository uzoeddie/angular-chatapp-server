import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { userQueue } from '@queues/user.queue';
import { userCache } from '@redis/user-cache';
export class Block {
  public async block(req: Request, res: Response): Promise<void> {
    const blockedBy: Promise<void> = userCache.updateBlockedUserPropInRedisCache(
      `${req.params.followerId}`,
      'blockedBy',
      `${req.currentUser?.userId}`,
      'block'
    );
    const blocked: Promise<void> = userCache.updateBlockedUserPropInRedisCache(
      `${req.currentUser?.userId}`,
      'blocked',
      `${req.params.followerId}`,
      'block'
    );
    await Promise.all([blockedBy, blocked]);
    userQueue.addUserJob('addBlockedUserToDB', {
      keyOne: `${req.currentUser?.userId}`,
      keyTwo: `${req.params.followerId}`
    });
    res.status(HTTP_STATUS.OK).json({ message: 'User blocked' });
  }

  public async unblock(req: Request, res: Response): Promise<void> {
    const blockedBy: Promise<void> = userCache.updateBlockedUserPropInRedisCache(
      `${req.params.followerId}`,
      'blockedBy',
      `${req.currentUser?.userId}`,
      'unblock'
    );
    const blocked: Promise<void> = userCache.updateBlockedUserPropInRedisCache(
      `${req.currentUser?.userId}`,
      'blocked',
      `${req.params.followerId}`,
      'unblock'
    );
    await Promise.all([blockedBy, blocked]);
    userQueue.addUserJob('removeUnblockedUserFromDB', {
      keyOne: `${req.currentUser?.userId}`,
      keyTwo: `${req.params.followerId}`
    });
    res.status(HTTP_STATUS.OK).json({ message: 'User unblocked' });
  }
}
