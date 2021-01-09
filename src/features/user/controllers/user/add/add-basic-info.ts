import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { userInfoQueue } from '@queues/user-info.queue';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { genderSchema, birthdaySchema, relationshipSchema } from '@user/schemes/user/info';
import { updateSingleUserItemInRedisCache } from '@redis/user-info-cache';
import { IUserDocument } from '@user/interface/user.interface';
import { socketIOUserObject } from '@sockets/users';

export class AddBasicInfo {
  @joiValidation(genderSchema)
  public async gender(req: Request, res: Response): Promise<void> {
    const cachedUser: IUserDocument = await updateSingleUserItemInRedisCache(`${req.currentUser?.userId}`, 'gender', req.body.gender);
    socketIOUserObject.emit('update user', cachedUser);
    userInfoQueue.addUserInfoJob('updateGenderInCache', {
      key: `${req.currentUser?.username}`,
      value: req.body.gender
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Gender updated successfully' });
  }

  @joiValidation(birthdaySchema)
  public async birthday(req: Request, res: Response): Promise<void> {
    const cachedUser: IUserDocument = await updateSingleUserItemInRedisCache(`${req.currentUser?.userId}`, 'birthDay', { month: req.body.month, day: req.body.day });
    socketIOUserObject.emit('update user', cachedUser);
    userInfoQueue.addUserInfoJob('updateBirthdayInCache', {
      key: `${req.currentUser?.username}`,
      value: { month: req.body.month, day: req.body.day }
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Birthday updated successfully' });
  }

  @joiValidation(relationshipSchema)
  public async relationship(req: Request, res: Response): Promise<void> {
    const cachedUser: IUserDocument = await updateSingleUserItemInRedisCache(`${req.currentUser?.userId}`, 'relationship', req.body.relationship);
    socketIOUserObject.emit('update user', cachedUser);
    userInfoQueue.addUserInfoJob('updateRelationshipInCache', {
      key: `${req.currentUser?.username}`,
      value: req.body.relationship
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Relationship updated successfully' });
  }
}
