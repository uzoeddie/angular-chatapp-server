import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

import { UserModel } from '@user/models/user.schema';
import { IUserDocument } from '@user/interface/user.interface';
import { userInfoQueue } from '@queues/user-info.queue';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { placesSchema } from '@user/schemes/user/info';

export class AddPlacesLived {
  @joiValidation(placesSchema)
  public async places(req: Request, res: Response): Promise<void> {
    const updatedPlaces: IUserDocument = (await UserModel.findOneAndUpdate(
      { username: req.currentUser?.username },
      {
        $push: {
          placesLived: {
            city: req.body.city,
            country: req.body.country,
            year: req.body.year,
            month: req.body.month
          }
        }
      },
      { new: true }
    )
      .select('placesLived')
      .slice('placesLived', -1)
      .exec()) as IUserDocument;
    userInfoQueue.addUserInfoJob('updateUserPlaceInCache', {
      key: `${req.currentUser?.userId}`,
      prop: 'placesLived',
      value: updatedPlaces.placesLived[0],
      type: 'add'
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Places updated successfully' });
  }
}
