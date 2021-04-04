import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { userInfoQueue } from '@queues/user-info.queue';
import { IUserDocument, IUserSchool, IUserWork } from '@user/interface/user.interface';
import { updateUserPropListInfoInRedisCache } from '@redis/user-info-cache';
import { socketIOUserObject } from '@sockets/users';

export class DeleteWorkAndEducation {
  public async work(req: Request, res: Response): Promise<void> {
    const work: IUserWork = {
      _id: '',
      company: '',
      position: '',
      city: '',
      description: '',
      from: '',
      to: ''
    };
    const cachedUser: IUserDocument = await updateUserPropListInfoInRedisCache(
      `${req.currentUser?.userId}`,
      'work',
      work,
      'remove',
      req.params.workId
    );
    socketIOUserObject.emit('update user', cachedUser);
    userInfoQueue.addUserInfoJob('updateUserWorkInCache', {
      key: `${req.currentUser?.username}`,
      value: null,
      type: 'remove',
      paramsId: req.params.workId
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Work deleted successfully', notification: true });
  }

  public async education(req: Request, res: Response): Promise<void> {
    const school: IUserSchool = {
      _id: '',
      name: '',
      course: '',
      degree: '',
      from: '',
      to: ''
    };
    const cachedUser: IUserDocument = await updateUserPropListInfoInRedisCache(
      `${req.currentUser?.userId}`,
      'school',
      school,
      'remove',
      req.params.schoolId
    );
    socketIOUserObject.emit('update user', cachedUser);
    userInfoQueue.addUserInfoJob('updateUserSchoolInCache', {
      key: `${req.currentUser?.username}`,
      value: null,
      type: 'remove',
      paramsId: req.params.schoolId
    });
    res.status(HTTP_STATUS.OK).json({ message: 'School deleted successfully', notification: true });
  }
}
