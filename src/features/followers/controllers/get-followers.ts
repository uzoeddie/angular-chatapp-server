import HTTP_STATUS from 'http-status-codes';
import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { FollowerModel } from '@followers/models/follower.schema';
import { getFollowersFromRedisCache } from '@redis/follower-cache';
import { ObjectId } from 'mongodb';
import { IFollowerDocument } from '@followers/interface/followers.interface';
export class Get {
  // TODO: work on this method
  public async followers(req: Request, res: Response): Promise<void> {
    let followers;
    const cachedFollowers: string[] = await getFollowersFromRedisCache(`${req.currentUser?.userId}`);
    if (cachedFollowers) {
      followers = cachedFollowers;
    } else {
      const userObjectId = mongoose.Types.ObjectId(req.currentUser?.userId);
      followers = await FollowerModel.find({ followeeId: userObjectId }, { _id: 0, followeeId: 1, followerId: 1 }).lean().exec();
    }
    res.status(HTTP_STATUS.OK).json({ message: 'User followers', userFollowers: followers });
  }

  public async following(req: Request, res: Response): Promise<void> {
    const userObjectId: ObjectId = mongoose.Types.ObjectId(req.currentUser?.userId);
    const following: Promise<IFollowerDocument[]> = await FollowerModel.find(
      { followerId: userObjectId },
      { _id: 0, followeeId: 1, followerId: 1 }
    )
      .lean()
      .populate({
        path: 'followerId',
        select: 'username avatarColor postCount followersCount followingCount birthDay profilePicture'
      })
      .populate({
        path: 'followeeId',
        select: 'username avatarColor postCount followersCount followingCount birthDay profilePicture'
      })
      .exec();
    res.status(HTTP_STATUS.OK).json({ message: 'User following', following });
  }

  public async userFollowers(req: Request, res: Response): Promise<void> {
    const userObjectId: ObjectId = mongoose.Types.ObjectId(req.params.userId);
    const followers: Promise<IFollowerDocument[]> = await FollowerModel.find(
      { followeeId: userObjectId },
      { _id: 0, followeeId: 1, followerId: 1 }
    )
      .lean()
      .populate({
        path: 'followerId',
        select: 'username avatarColor postCount followersCount followingCount birthDay profilePicture'
      })
      .populate({
        path: 'followeeId',
        select: 'username avatarColor postCount followersCount followingCount birthDay profilePicture'
      })
      .exec();
    res.status(HTTP_STATUS.OK).json({ message: 'User followers', followers });
  }
}
