import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

import { userInfoQueue } from '@queues/user-info.queue';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { aboutSchema, quotesSchema } from '@user/schemes/user/info';
import { userInfoCache } from '@redis/user-info-cache';
import { IUserDocument } from '@user/interface/user.interface';
import { socketIOUserObject } from '@sockets/users';

export class AddDetails {
  @joiValidation(aboutSchema)
  public async about(req: Request, res: Response): Promise<void> {
    const cachedUser: IUserDocument = await userInfoCache.updateSingleUserItemInRedisCache(
      `${req.currentUser?.userId}`,
      'about',
      req.body.about
    );
    socketIOUserObject.emit('update user', cachedUser);
    userInfoQueue.addUserInfoJob('updateAboutInfoInCache', {
      key: `${req.currentUser?.username}`,
      value: req.body.about
    });
    res.status(HTTP_STATUS.OK).json({ message: 'About you updated successfully' });
  }

  @joiValidation(quotesSchema)
  public async quotes(req: Request, res: Response): Promise<void> {
    const cachedUser: IUserDocument = await userInfoCache.updateSingleUserItemInRedisCache(
      `${req.currentUser?.userId}`,
      'quotes',
      req.body.quotes
    );
    socketIOUserObject.emit('update user', cachedUser);
    userInfoQueue.addUserInfoJob('updateQuotesInCache', {
      key: `${req.currentUser?.username}`,
      value: req.body.quotes
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Quotes updated successfully' });
  }
}
