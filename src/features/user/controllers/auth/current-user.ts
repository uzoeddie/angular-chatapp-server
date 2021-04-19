import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { IUserDocument } from '@user/interface/user.interface';
import { UserModel } from '@user/models/user.schema';
import { getUserFromCache } from '@redis/user-cache';
export class CurrentUser {
  public async read(req: Request, res: Response): Promise<void> {
    let isUser: boolean;
    let token = null;
    const cachedUser: IUserDocument = await getUserFromCache(`${req.currentUser?.userId}`);
    const existingAuthUser: IUserDocument = cachedUser
      ? cachedUser
      : ((await UserModel.findById({ _id: req.currentUser?.userId })) as IUserDocument);
    if (!existingAuthUser) {
      isUser = false;
      token = null;
    } else {
      isUser = true;
      token = req.session?.jwt;
    }
    res.status(HTTP_STATUS.OK).json({ token, isUser });
  }
}
