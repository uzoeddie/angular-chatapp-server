import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { userInfoQueue } from '@queues/user-info.queue';
import { UserModel } from '@user/models/user.schema';
import { workSchema, educationSchema } from '@user/schemes/user/info';

export class EditWorkAndEducation {
    @joiValidation(workSchema)
    public async work(req: Request, res: Response): Promise<void> {
        await UserModel.updateOne(
            { 
                _id: req.currentUser?.userId,
                'work._id': req.params.workId
            },
            {
                $set: {
                    'work.$.company': req.body.company,
                    'work.$.position': req.body.position,
                    'work.$.city': req.body.city,
                    'work.$.description': req.body.description,
                    'work.$.from': req.body.from,
                    'work.$.to': req.body.to
                }
            }
        );
        const updatedWork = {
            _id: req.params.workId,
            company: req.body.company,
            position: req.body.position,
            city: req.body.city,
            description: req.body.description,
            from: req.body.from,
            to: req.body.to
        };
        userInfoQueue.addUserInfoJob('updateUserWorkInCache', { key: `${req.currentUser?.userId}`, prop: 'work', value: updatedWork, type: 'edit' });
        res.status(HTTP_STATUS.OK).json({ message: 'Work updated successfully' });
    }

    @joiValidation(educationSchema)
    public async education(req: Request, res: Response): Promise<void> {
        await UserModel.updateOne(
            { 
                _id: req.currentUser?.userId,
                'school._id': req.params.schoolId
            },
            {
                $set: {
                    'school.$.name': req.body.name,
                    'school.$.course': req.body.course,
                    'school.$.degree': req.body.degree,
                    'school.$.from': req.body.from,
                    'school.$.to': req.body.to
                }
            }
        );
        const updatedSchool = {
            _id: req.params.schoolId,
            name: req.body.name,
            course: req.body.course,
            degree: req.body.degree,
            from: req.body.from,
            to: req.body.to
        };
        userInfoQueue.addUserInfoJob('updateUserSchoolInCache', { key: `${req.currentUser?.userId}`, prop: 'school', value: updatedSchool, type: 'edit' });
        res.status(HTTP_STATUS.OK).json({ message: 'Education updated successfully' });
    }
}