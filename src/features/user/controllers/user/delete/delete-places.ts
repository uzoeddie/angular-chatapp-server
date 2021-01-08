import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { userInfoQueue } from '@queues/user-info.queue';
import { IUserDocument, IUserPlacesLived } from '@user/interface/user.interface';
import { updateUserPropListInfoInRedisCache } from '@redis/user-info-cache';
import { eventEmitter } from '@global/helpers';

export class DeletePlacesLived {
  public async places(req: Request, res: Response): Promise<void> {
    const placesLived: IUserPlacesLived = {
      _id: '',
      city: '',
      country: '',
      year: '',
      month: ''
    };
    const cachedUser: IUserDocument = await updateUserPropListInfoInRedisCache(`${req.currentUser?.userId}`, 'placesLived', placesLived, 'remove', req.params.placeId);
    eventEmitter.emit('userInfo', cachedUser);
    userInfoQueue.addUserInfoJob('updateUserPlaceInCache', {
      key: `${req.currentUser?.username}`,
      value: null,
      type: 'remove',
      paramsId: req.params.placeId
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Place deleted successfully' });
  }
}
