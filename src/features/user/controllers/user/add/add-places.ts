import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

import { IUserDocument, IUserPlacesLived } from '@user/interface/user.interface';
import { userInfoQueue } from '@queues/user-info.queue';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { placesSchema } from '@user/schemes/user/info';
import { updateUserPropListInfoInRedisCache } from '@redis/user-info-cache';
import { ObjectID } from 'mongodb';
import { socketIOUserObject } from '@sockets/users';

export class AddPlacesLived {
  @joiValidation(placesSchema)
  public async places(req: Request, res: Response): Promise<void> {
    const createdObjectId: ObjectID = new ObjectID();
    const placesLived: IUserPlacesLived = {
      _id: createdObjectId,
      city: req.body.city,
      country: req.body.country,
      year: req.body.year,
      month: req.body.month
    };
    const cachedUser: IUserDocument = await updateUserPropListInfoInRedisCache(
      `${req.currentUser?.userId}`,
      'placesLived',
      placesLived,
      'add'
    );
    socketIOUserObject.emit('update user', cachedUser);
    userInfoQueue.addUserInfoJob('updateUserPlaceInCache', {
      key: `${req.currentUser?.username}`,
      value: placesLived,
      type: 'add'
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Places updated successfully' });
  }
}
