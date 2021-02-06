import HTTP_STATUS from 'http-status-codes';
import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { FollowerModel } from '@followers/models/follower.schema';
import { getFollowersFromRedisCache } from '@redis/follower-cache';
import { ObjectId } from 'mongodb';
import { IFollower } from '@followers/interface/followers.interface';
export class Get {
  public async following(req: Request, res: Response): Promise<void> {
    const userObjectId: ObjectId = mongoose.Types.ObjectId(req.currentUser?.userId);
    const cachedFollowers: IFollower[] = await getFollowersFromRedisCache(`followers:${req.currentUser?.userId}`);
    const following: IFollower[] = (cachedFollowers.length
      ? cachedFollowers
      : await FollowerModel.find({ followerId: userObjectId }, { _id: 0, followeeId: 1, followerId: 1 })
          .lean()
          .populate({
            path: 'followerId',
            select: 'username avatarColor postCount followersCount followingCount birthDay profilePicture'
          })
          .populate({
            path: 'followeeId',
            select: 'username avatarColor postCount followersCount followingCount birthDay profilePicture'
          })
          .exec()) as IFollower[];
    res.status(HTTP_STATUS.OK).json({ message: 'User following', following });
  }

  public async userFollowers(req: Request, res: Response): Promise<void> {
    const userObjectId: ObjectId = mongoose.Types.ObjectId(req.params.userId);
    const cachedFollowers: IFollower[] = await getFollowersFromRedisCache(`following:${req.params.userId}`);
    const followers: IFollower[] = (cachedFollowers.length
      ? cachedFollowers
      : await FollowerModel.find({ followeeId: userObjectId }, { _id: 0, followeeId: 1, followerId: 1 })
          .lean()
          .populate({
            path: 'followerId',
            select: 'username avatarColor postCount followersCount followingCount birthDay profilePicture'
          })
          .populate({
            path: 'followeeId',
            select: 'username avatarColor postCount followersCount followingCount birthDay profilePicture'
          })
          .exec()) as IFollower[];
    res.status(HTTP_STATUS.OK).json({ message: 'User followers', followers });
  }
}
