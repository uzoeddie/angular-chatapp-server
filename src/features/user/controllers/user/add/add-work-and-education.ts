import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

import { UserModel } from '@user/models/user.schema';
import { IUserDocument } from '@user/interface/user.interface';
import { userInfoQueue } from '@queues/user-info.queue';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { educationSchema, workSchema } from '@user/schemes/user/info';

export class AddWorkAndEducation {
    @joiValidation(workSchema)
    public async work(req: Request, res: Response): Promise<void> {
        const updatedWork: Promise<any> = UserModel.updateOne(
            { username: req.currentUser?.username },
            {
                $push: {
                    work: {
                        company: req.body.company,
                        position: req.body.position,
                        city: req.body.city,
                        description: req.body.description,
                        from: req.body.from,
                        to: req.body.to
                    }
                }
            }
        ).exec();
        const userData: Promise<IUserDocument | null> = UserModel.findOne({ username: req.currentUser?.username }).select('work').slice('work', -1).exec();
        const response: [Promise<any>, IUserDocument] = await Promise.all([updatedWork, userData]) as [Promise<any>, IUserDocument];
        userInfoQueue.addUserInfoJob('updateUserWorkInCache', { key: `${req.currentUser?.userId}`, prop: 'work', value: response[1].work[0], type: 'add' });
        res.status(HTTP_STATUS.OK).json({ message: 'Work updated successfully' });
    }

    @joiValidation(educationSchema)
    public async education(req: Request, res: Response): Promise<void> {
        const updatedSchool: Promise<any> = UserModel.updateOne(
            { username: req.currentUser?.username },
            {
                $push: {
                    school: {
                        name: req.body.name,
                        course: req.body.course,
                        degree: req.body.degree,
                        from: req.body.from,
                        to: req.body.to
                    }
                }
            }
        ).exec();
        const userData: Promise<IUserDocument | null> = UserModel.findOne({ username: req.currentUser?.username }).select('school').slice('school', -1).exec();
        const response: [Promise<any>, IUserDocument] = await Promise.all([updatedSchool, userData]) as [Promise<any>, IUserDocument];
        userInfoQueue.addUserInfoJob('updateUserSchoolInCache', { key: `${req.currentUser?.userId}`, prop: 'school', value: response[1].school[0], type: 'add' });
        res.status(HTTP_STATUS.OK).json({ message: 'Education updated successfully' });
    }
}