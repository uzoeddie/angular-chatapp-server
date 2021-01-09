import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { userInfoQueue } from '@queues/user-info.queue';
import { placesSchema } from '@user/schemes/user/info';
import { IUserDocument, IUserPlacesLived } from '@user/interface/user.interface';
import { updateUserPropListInfoInRedisCache } from '@redis/user-info-cache';
import { socketIOUserObject } from '@sockets/users';

export class EditPlacesLived {
  @joiValidation(placesSchema)
  public async places(req: Request, res: Response): Promise<void> {
    const updatedPlace: IUserPlacesLived = {
      _id: req.params.placeId,
      city: req.body.city,
      country: req.body.country,
      year: req.body.year,
      month: req.body.month
    };
    const cachedUser: IUserDocument = await updateUserPropListInfoInRedisCache(`${req.currentUser?.userId}`, 'placesLived', updatedPlace, 'edit');
    socketIOUserObject.emit('update user', cachedUser);
    userInfoQueue.addUserInfoJob('updateUserPlaceInCache', {
      key: `${req.currentUser?.username}`,
      value: updatedPlace,
      type: 'edit',
      paramsId: req.params.placeId
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Places updated successfully' });
  }
}
