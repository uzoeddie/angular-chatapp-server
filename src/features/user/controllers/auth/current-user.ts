import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { IUserDocument } from '@user/interface/user.interface';
import { UserModel } from '@user/models/user.schema';
import { userCache } from '@redis/user-cache';
export class CurrentUser {
  public async read(req: Request, res: Response): Promise<void> {
    let isUser = false;
    let token = null;
    const cachedUser: IUserDocument = await userCache.getUserFromCache(`${req.currentUser?.userId}`);
    const existingAuthUser: IUserDocument = cachedUser
      ? cachedUser
      : ((await UserModel.findById({ _id: req.currentUser?.userId }).exec()) as IUserDocument);
    if (existingAuthUser) {
      isUser = true;
      token = req.session?.jwt;
    }
    res.status(HTTP_STATUS.OK).json({ token, isUser });
  }
}
