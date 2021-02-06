import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { followerQueue } from '@queues/follower.queue';
import { getUserFromCache, updateUserFollowersInRedisCache } from '@redis/user-cache';
import { IUserDocument } from '@user/interface/user.interface';
import { IFollower } from '@followers/interface/followers.interface';
import { saveFollowerToRedisCache } from '@redis/follower-cache';
import { ObjectID } from 'mongodb';
import { socketIOFollowerObject } from '@sockets/follower';

export class Add {
  public async follower(req: Request, res: Response): Promise<void> {
    const cachedFollower: Promise<IUserDocument> = getUserFromCache(req.params.followerId);
    const cachedUser: Promise<IUserDocument> = getUserFromCache(req.currentUser!.userId);
    const response: [IUserDocument, IUserDocument] = await Promise.all([cachedUser, cachedFollower]);
    const followerObjectId: ObjectID = new ObjectID();
    const addFollower: IFollower = {
      _id: followerObjectId,
      followerId: {
        _id: response[0]._id,
        username: response[0].username,
        avatarColor: response[0].avatarColor,
        postCount: response[0].postCount,
        followersCount: response[0].followersCount,
        followingCount: response[0].followingCount,
        birthDay: response[0].birthDay,
        profilePicture: response[0].profilePicture
      },
      followeeId: {
        _id: response[1]._id,
        username: response[1].username,
        avatarColor: response[1].avatarColor,
        postCount: response[1].postCount,
        followersCount: response[1].followersCount,
        followingCount: response[1].followingCount,
        birthDay: response[1].birthDay,
        profilePicture: response[1].profilePicture
      },
      createdAt: new Date()
    };
    socketIOFollowerObject.emit('add follower', addFollower);
    const addFollowerToCache: Promise<void> = saveFollowerToRedisCache(`followers:${req.currentUser!.userId}`, addFollower);
    const addFolloweeToCache: Promise<void> = saveFollowerToRedisCache(`following:${req.params.followerId}`, addFollower);
    const followersCount: Promise<void> = updateUserFollowersInRedisCache(`${req.params.followerId}`, 'followersCount', 1);
    const followingCount: Promise<void> = updateUserFollowersInRedisCache(`${req.currentUser?.userId}`, 'followingCount', 1);
    await Promise.all([addFollowerToCache, addFolloweeToCache, followersCount, followingCount]);

    followerQueue.addFollowerJob('addFollowerDB', {
      keyOne: `${req.currentUser?.userId}`,
      keyTwo: `${req.params.followerId}`,
      username: req.currentUser?.username,
      followerDocumentId: followerObjectId
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Following user now', notification: true });
  }
}
