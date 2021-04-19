import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { followerQueue } from '@queues/follower.queue';
import { userCache } from '@redis/user-cache';
import { followerCache } from '@redis/follower-cache';

export class Remove {
  public async following(req: Request, res: Response): Promise<void> {
    const removeFollowerToCache: Promise<void> = followerCache.removeFollowerFromRedisCache(
      `followers:${req.currentUser!.userId}`,
      req.params.objectId
    );
    const removeFolloweeToCache: Promise<void> = followerCache.removeFollowerFromRedisCache(
      `following:${req.params.followerId}`,
      req.params.objectId
    );
    const followersCount: Promise<void> = userCache.updateUserFollowersInRedisCache(`${req.params.followerId}`, 'followersCount', -1);
    const followingCount: Promise<void> = userCache.updateUserFollowersInRedisCache(`${req.currentUser?.userId}`, 'followingCount', -1);
    await Promise.all([removeFollowerToCache, removeFolloweeToCache, followersCount, followingCount]);
    followerQueue.addFollowerJob('removeFollowerFromDB', {
      keyOne: `${req.currentUser?.userId}`,
      keyTwo: `${req.params.followerId}`
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Unfollowed user now' });
  }
}
