import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

import { UserModel } from '@user/models/user.schema';
import { userInfoQueue } from '@queues/user-info.queue';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { genderSchema, birthdaySchema, relationshipSchema } from '@user/schemes/user/info';

export class AddBasicInfo {
  @joiValidation(genderSchema)
  public async gender(req: Request, res: Response): Promise<void> {
    await UserModel.updateOne({ _id: req.currentUser?.userId }, { $set: { gender: req.body.gender } });
    userInfoQueue.addUserInfoJob('updateBasicInfoInCache', {
      key: `${req.currentUser?.userId}`,
      prop: 'gender',
      value: req.body.gender
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Gender updated successfully' });
  }

  @joiValidation(birthdaySchema)
  public async birthday(req: Request, res: Response): Promise<void> {
    await UserModel.updateOne(
      { _id: req.currentUser?.userId },
      { $set: { 'birthDay.month': req.body.month, 'birthDay.day': req.body.day } }
    );
    userInfoQueue.addUserInfoJob('updateBirthdayInCache', {
      key: `${req.currentUser?.userId}`,
      prop: 'birthDay',
      value: { month: req.body.month, day: req.body.day }
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Birthday updated successfully' });
  }

  @joiValidation(relationshipSchema)
  public async relationship(req: Request, res: Response): Promise<void> {
    await UserModel.updateOne({ username: req.currentUser?.username }, { $set: { relationship: req.body.relationship } });
    userInfoQueue.addUserInfoJob('updateQuotesInCache', {
      key: `${req.currentUser?.userId}`,
      prop: 'relationship',
      value: req.body.relationship
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Relationship updated successfully' });
  }
}
