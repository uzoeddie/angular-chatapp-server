import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import mongoose from 'mongoose';
import _ from 'lodash';
import { userInfoQueue } from '@queues/user-info.queue';
import { IUserDocument } from '@user/interface/user.interface';
import { UserModel } from '@user/models/user.schema';

export class DeleteWorkAndEducation {
    public async work(req: Request, res: Response): Promise<void> {
        const userData: Promise<IUserDocument> = UserModel.findOne({ username: req.currentUser?.username }).select('work').exec() as Promise<IUserDocument>;
        const updatedWork: Promise<any> = UserModel.updateOne(
            { username: req.currentUser?.username },
            { $pull: { work: { _id: mongoose.Types.ObjectId(req.params.workId) } } }
        ).exec();
        const response: [IUserDocument, any] = await Promise.all([userData, updatedWork]);
        userInfoQueue.addUserInfoJob('updateUserWorkInCache', 
            { key: `${req.currentUser?.userId}`, prop: 'work', value: null, type: 'remove', data: response[0].work, paramId: req.params.workId },
        );
        res.status(HTTP_STATUS.OK).json({ message: 'Work deleted successfully' });
    }

    public async education(req: Request, res: Response): Promise<void> {
        const userData: Promise<IUserDocument> = UserModel.findOne({ username: req.currentUser?.username }).select('school').exec() as Promise<IUserDocument>;
        const updatedSchool: Promise<any> = UserModel.updateOne(
            { username: req.currentUser?.username },
            { $pull: { school: { _id: mongoose.Types.ObjectId(req.params.schoolId) } } }
        ).exec();
        const response: [IUserDocument, any] = await Promise.all([userData, updatedSchool]);
        userInfoQueue.addUserInfoJob('updateUserSchoolInCache', 
            { key: `${req.currentUser?.userId}`, prop: 'school', value: null, type: 'remove', data: response[0].school, paramId: req.params.schoolId }, 
        );
        res.status(HTTP_STATUS.OK).json({ message: 'School deleted successfully' });
    }
}