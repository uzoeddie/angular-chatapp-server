import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ObjectID } from 'mongodb';
import { followerQueue } from '@queues/follower.queue';
import { userCache } from '@redis/user-cache';
import { IUserDocument } from '@user/interface/user.interface';
import { IFollower } from '@followers/interface/followers.interface';
import { followerCache } from '@redis/follower-cache';
import { socketIOFollowerObject } from '@sockets/follower';

export class Add {
  public async follower(req: Request, res: Response): Promise<void> {
    const cachedFollower: Promise<IUserDocument> = userCache.getUserFromCache(req.params.followerId);
    const cachedUser: Promise<IUserDocument> = userCache.getUserFromCache(req.currentUser!.userId);
    const response: [IUserDocument, IUserDocument] = await Promise.all([cachedUser, cachedFollower]);
    const followerObjectId: ObjectID = new ObjectID();
    const addFollower: IFollower = Add.prototype.followerData(response, followerObjectId);
    socketIOFollowerObject.emit('add follower', addFollower);
    const addFollowerToCache: Promise<void> = followerCache.saveFollowerToRedisCache(`followers:${req.currentUser!.userId}`, addFollower);
    const addFolloweeToCache: Promise<void> = followerCache.saveFollowerToRedisCache(`following:${req.params.followerId}`, addFollower);
    const followersCount: Promise<void> = userCache.updateUserFollowersInRedisCache(`${req.params.followerId}`, 'followersCount', 1);
    const followingCount: Promise<void> = userCache.updateUserFollowersInRedisCache(`${req.currentUser?.userId}`, 'followingCount', 1);
    await Promise.all([addFollowerToCache, addFolloweeToCache, followersCount, followingCount]);

    followerQueue.addFollowerJob('addFollowerDB', {
      keyOne: `${req.currentUser?.userId}`,
      keyTwo: `${req.params.followerId}`,
      username: req.currentUser!.username,
      followerDocumentId: followerObjectId
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Following user now', notification: true });
  }

  private followerData(response: [IUserDocument, IUserDocument], followerObjectId: ObjectID): IFollower {
    return {
      _id: followerObjectId,
      followerId: {
        _id: response[0]._id,
        username: response[0].username,
        avatarColor: response[0].avatarColor,
        postCount: response[0].postCount,
        followersCount: response[0].followersCount,
        followingCount: response[0].followingCount,
        birthDay: response[0].birthDay,
        profilePicture: response[0].profilePicture,
        userProfile: response[0]
      },
      followeeId: {
        _id: response[1]._id,
        username: response[1].username,
        avatarColor: response[1].avatarColor,
        postCount: response[1].postCount,
        followersCount: response[1].followersCount,
        followingCount: response[1].followingCount,
        birthDay: response[1].birthDay,
        profilePicture: response[1].profilePicture,
        userProfile: response[1]
      },
      createdAt: new Date()
    };
  }
}
