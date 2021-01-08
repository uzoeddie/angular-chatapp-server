import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { IUserDocument, IUserSchool, IUserWork } from '@user/interface/user.interface';
import { userInfoQueue } from '@queues/user-info.queue';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { educationSchema, workSchema } from '@user/schemes/user/info';
import { updateUserPropListInfoInRedisCache } from '@redis/user-info-cache';
import { ObjectID } from 'mongodb';
import { eventEmitter } from '@global/helpers';

export class AddWorkAndEducation {
  @joiValidation(workSchema)
  public async work(req: Request, res: Response): Promise<void> {
    const createdObjectId: ObjectID = new ObjectID();
    const work: IUserWork = {
      _id: createdObjectId,
      company: req.body.company,
      position: req.body.position,
      city: req.body.city,
      description: req.body.description,
      from: req.body.from,
      to: req.body.to
    };
    const cachedUser: IUserDocument = await updateUserPropListInfoInRedisCache(`${req.currentUser?.userId}`, 'work', work, 'add');
    eventEmitter.emit('userInfo', cachedUser);
    userInfoQueue.addUserInfoJob('updateUserWorkInCache', {
      key: `${req.currentUser?.username}`,
      value: work,
      type: 'add'
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Work updated successfully' });
  }

  @joiValidation(educationSchema)
  public async education(req: Request, res: Response): Promise<void> {
    const createdObjectId: ObjectID = new ObjectID();
    const school: IUserSchool = {
      _id: createdObjectId,
      name: req.body.name,
      course: req.body.course,
      degree: req.body.degree,
      from: req.body.from,
      to: req.body.to
    };
    const cachedUser: IUserDocument = await updateUserPropListInfoInRedisCache(`${req.currentUser?.userId}`, 'school', school, 'add');
    eventEmitter.emit('userInfo', cachedUser);
    userInfoQueue.addUserInfoJob('updateUserSchoolInCache', {
      key: `${req.currentUser?.username}`,
      value: school,
      type: 'add'
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Education updated successfully' });
  }
}
