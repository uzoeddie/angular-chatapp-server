import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

import { UserModel } from '@user/models/user.schema';
import { Helpers } from '@global/helpers';
import { getUserFromCache, getUsersFromCache } from '@redis/user-cache';
import { FollowerModel } from '@followers/models/follower.schema';
import { getUserPostsFromCache } from '@redis/post-cache';
import { IUserDocument } from '@user/interface/user.interface';
import { IFollower, IFollowerDocument } from '@followers/interface/followers.interface';
import { IPostDocument } from '@posts/interface/post.interface';
import { LeanDocument } from 'mongoose';
import { getFollowersFromRedisCache } from '@redis/follower-cache';

const PAGE_SIZE = 100;

interface IAllUser {
  newSkip: number;
  limit: number;
  skip: number;
  userId: string;
}

export class GetUser {
  public async all(req: Request, res: Response): Promise<void> {
    const { page } = req.params;
    const skip: number = (parseInt(page) - 1) * PAGE_SIZE;
    const limit: number = PAGE_SIZE * parseInt(page);
    const newSkip: number = skip === 0 ? skip : skip + 1;
    const allUsers: IUserDocument[] | LeanDocument<IUserDocument>[] = await this.allUsers({
      newSkip,
      limit,
      skip,
      userId: `${req.currentUser?.userId}`
    });
    const followers: Promise<IFollowerDocument[] | IFollower[]> = this.followers(`${req.currentUser?.userId}`, limit, skip);
    const response: (IFollowerDocument[] | IFollower[])[] = await Promise.all([followers]);
    res.status(HTTP_STATUS.OK).json({ message: 'Get users', users: allUsers, followers: response[0] });
  }

  public async profile(req: Request, res: Response): Promise<void> {
    const cachedUser: IUserDocument = await getUserFromCache(`${req.currentUser?.userId}`);
    const existingUser: IUserDocument = (cachedUser
      ? cachedUser
      : await UserModel.findOne({ _id: req.currentUser?.userId }).lean()) as IUserDocument;
    res.status(HTTP_STATUS.OK).json({ message: 'Get user profile', user: existingUser });
  }

  public async username(req: Request, res: Response): Promise<void> {
    const username: string = Helpers.firstLetterUppercase(req.params.username);
    const cachedUser: Promise<IUserDocument> = getUserFromCache(req.params.userId);
    const cachecUserPosts: Promise<IPostDocument[]> = getUserPostsFromCache('post', parseInt(req.params.uId, 10));
    const cacheResponse: [IUserDocument, IPostDocument[]] = await Promise.all([cachedUser, cachecUserPosts]);
    const existingUser: IUserDocument = (cacheResponse[0] ? cacheResponse[0] : UserModel.findOne({ username }).lean()) as IUserDocument;
    const userPosts: IPostDocument[] | Promise<IPostDocument[]> = cacheResponse[1]
      ? cacheResponse[1]
      : Helpers.getUserPosts({ username }, 0, 100, { createdAt: -1 });
    const response: [IUserDocument, IPostDocument[]] = await Promise.all([existingUser, userPosts]);
    res.status(HTTP_STATUS.OK).json({ message: 'Get user profile by username', user: response[0], posts: response[1] });
  }

  private async allUsers({ newSkip, limit, skip, userId }: IAllUser): Promise<IUserDocument[] | LeanDocument<IUserDocument>[]> {
    let users;
    const cachedUser: IUserDocument[] = await getUsersFromCache(newSkip, limit, userId);
    if (cachedUser.length) {
      users = cachedUser;
    } else {
      users = UserModel.find({ _id: { $ne: userId } })
        .lean()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
    }
    return users;
  }

  private async followers(userId: string, limit: number, skip: number): Promise<IFollowerDocument[] | IFollower[]> {
    const cachedFollowers: IFollower[] = await getFollowersFromRedisCache(`followers:${userId}`);
    const userFollowers = cachedFollowers.length
      ? cachedFollowers
      : ((FollowerModel.find({ followerId: userId })
          .lean()
          .populate({
            path: 'followerId',
            select: 'username avatarColor postCount followersCount followingCount profilePicture'
          })
          .populate({
            path: 'followeeId',
            select: 'username avatarColor postCount followersCount followingCount profilePicture'
          })
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }) as unknown) as IFollowerDocument[]);
    return userFollowers;
  }
}
