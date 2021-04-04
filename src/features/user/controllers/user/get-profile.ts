import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

import { UserModel } from '@user/models/user.schema';
import { Helpers } from '@global/helpers';
import { getUserFromCache, getUsersFromCache } from '@redis/user-cache';
import { FollowerModel } from '@followers/models/follower.schema';
import { getUserPostsFromCache } from '@redis/post-cache';
import { IUserDocument } from '@user/interface/user.interface';
import { IFollowerDocument } from '@followers/interface/followers.interface';
import { IPostDocument } from '@posts/interface/post.interface';

const PAGE_SIZE = 100;

export class GetUser {
  public async all(req: Request, res: Response): Promise<void> {
    const { page } = req.params;
    const skip: number = (parseInt(page) - 1) * PAGE_SIZE;
    const limit: number = PAGE_SIZE * parseInt(page);
    const newSkip: number = skip === 0 ? skip : skip + 1;
    let allUsers;
    const cachedUser: IUserDocument[] = await getUsersFromCache(newSkip, limit, `${req.currentUser?.userId}`);
    if (cachedUser.length) {
      allUsers = cachedUser;
    } else {
      allUsers = UserModel.find({ _id: { $ne: req.currentUser?.userId } })
        .lean()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
    }
    const followers: IFollowerDocument[] = (FollowerModel.find({ followerId: req.currentUser?.userId })
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
      .sort({ createdAt: -1 }) as unknown) as IFollowerDocument[];
    const response: [IUserDocument[], IFollowerDocument[]] = ((await Promise.all([allUsers, followers])) as [
      IUserDocument[],
      IFollowerDocument[]
    ]) as [IUserDocument[], IFollowerDocument[]];
    res.status(HTTP_STATUS.OK).json({ message: 'Get users', users: response[0], followers: response[1] });
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
}
