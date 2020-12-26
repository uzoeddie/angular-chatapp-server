import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { userInfoQueue } from '@queues/user-info.queue';
import { UserModel } from '@user/models/user.schema';
import { placesSchema } from '@user/schemes/user/info';

export class EditPlacesLived {
    @joiValidation(placesSchema)
    public async places(req: Request, res: Response): Promise<void> {
        await UserModel.updateOne(
            { 
                _id: req.currentUser?.userId,
                'placesLived._id': req.params.placeId
            },
            {
                $set: {
                    'placesLived.$.city': req.body.city,
                    'placesLived.$.country': req.body.country,
                    'placesLived.$.year': req.body.year,
                    'placesLived.$.month': req.body.month,
                }
            }
        );
        const updatedPlace = {
            _id: req.params.placeId,
            city: req.body.city,
            country: req.body.country,
            year: req.body.year,
            month: req.body.month,
        };
        userInfoQueue.addUserInfoJob('updateUserPlaceInCache', { key: `${req.currentUser?.userId}`, prop: 'placesLived', value: updatedPlace, type: 'edit' });
        res.status(HTTP_STATUS.OK).json({ message: 'Places updated successfully' });
    }
}