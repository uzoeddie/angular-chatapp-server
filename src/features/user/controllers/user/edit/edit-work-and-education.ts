import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { userInfoQueue } from '@queues/user-info.queue';
import { workSchema, educationSchema } from '@user/schemes/user/info';
import { IUserDocument, IUserSchool, IUserWork } from '@user/interface/user.interface';
import { updateUserPropListInfoInRedisCache } from '@redis/user-info-cache';
import { socketIOUserObject } from '@sockets/users';

export class EditWorkAndEducation {
  @joiValidation(workSchema)
  public async work(req: Request, res: Response): Promise<void> {
    const updatedWork: IUserWork = {
      _id: req.params.workId,
      company: req.body.company,
      position: req.body.position,
      city: req.body.city,
      description: req.body.description,
      from: req.body.from,
      to: req.body.to
    };
    const cachedUser: IUserDocument = await updateUserPropListInfoInRedisCache(`${req.currentUser?.userId}`, 'work', updatedWork, 'edit');
    socketIOUserObject.emit('update user', cachedUser);
    userInfoQueue.addUserInfoJob('updateUserWorkInCache', {
      key: `${req.currentUser?.username}`,
      value: updatedWork,
      type: 'edit',
      paramsId: req.params.workId
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Work updated successfully' });
  }

  @joiValidation(educationSchema)
  public async education(req: Request, res: Response): Promise<void> {
    const updatedSchool: IUserSchool = {
      _id: req.params.schoolId,
      name: req.body.name,
      course: req.body.course,
      degree: req.body.degree,
      from: req.body.from,
      to: req.body.to
    };
    const cachedUser: IUserDocument = await updateUserPropListInfoInRedisCache(`${req.currentUser?.userId}`, 'school', updatedSchool, 'edit');
    socketIOUserObject.emit('update user', cachedUser);
    userInfoQueue.addUserInfoJob('updateUserSchoolInCache', {
      key: `${req.currentUser?.username}`,
      value: updatedSchool,
      type: 'edit',
      paramsId: req.params.schoolId
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Education updated successfully' });
  }
}
