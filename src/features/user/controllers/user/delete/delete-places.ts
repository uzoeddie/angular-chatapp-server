import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import mongoose from 'mongoose';
import { userInfoQueue } from '@queues/user-info.queue';
import { IUserDocument } from '@user/interface/user.interface';
import { UserModel } from '@user/models/user.schema';

export class DeletePlacesLived {
  public async places(req: Request, res: Response): Promise<void> {
    const userData: IUserDocument = (await UserModel.findOneAndUpdate(
      { username: req.currentUser?.username },
      {
        $pull: {
          placesLived: {
            _id: mongoose.Types.ObjectId(req.params.placeId)
          }
        }
      }
    )) as IUserDocument;
    userInfoQueue.addUserInfoJob('updateUserPlaceInCache', {
      key: `${req.currentUser?.userId}`,
      prop: 'placesLived',
      value: null,
      type: 'remove',
      data: userData.placesLived,
      paramId: req.params.placeId
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Place deleted successfully' });
  }
}
