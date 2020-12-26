import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import mongoose from 'mongoose';
import _ from 'lodash';
import { userInfoQueue } from '@queues/user-info.queue';
import { IUserDocument } from '@user/interface/user.interface';
import { UserModel } from '@user/models/user.schema';

export class DeletePlacesLived {
    public async places(req: Request, res: Response): Promise<void> {
        const userData: Promise<IUserDocument> = UserModel.findOne({ username: req.currentUser?.username }).select('placesLived').exec() as Promise<IUserDocument>;
        const updatedPlaces: Promise<any> = UserModel.updateOne(
            {  _id: req.currentUser?.userId, },
            { $pull: { placesLived: { _id: mongoose.Types.ObjectId(req.params.placeId) }}},
        ).exec();
        const response: [IUserDocument, any] = await Promise.all([userData, updatedPlaces]);
        userInfoQueue.addUserInfoJob('updateUserWorkInCache', { key: `${req.currentUser?.userId}`, prop: 'placesLived', value: null, type: 'remove', data: response[0].placesLived, paramId: req.params.placeId });
        res.status(HTTP_STATUS.OK).json({ message: 'Place deleted successfully' });
    }
}