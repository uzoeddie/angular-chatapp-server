import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import mongoose from 'mongoose';
import { userInfoQueue } from '@queues/user-info.queue';
import { IUserDocument } from '@user/interface/user.interface';
import { UserModel } from '@user/models/user.schema';

export class DeleteWorkAndEducation {
  public async work(req: Request, res: Response): Promise<void> {
    const userData: IUserDocument = (await UserModel.findOneAndUpdate(
      { username: req.currentUser?.username },
      {
        $pull: {
          work: {
            _id: mongoose.Types.ObjectId(req.params.workId)
          }
        }
      }
    )) as IUserDocument;
    userInfoQueue.addUserInfoJob('updateUserWorkInCache', {
      key: `${req.currentUser?.userId}`,
      prop: 'work',
      value: null,
      type: 'remove',
      data: userData.work,
      paramId: req.params.workId
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Work deleted successfully', notification: true });
  }

  public async education(req: Request, res: Response): Promise<void> {
    const userData: IUserDocument = (await UserModel.findOneAndUpdate(
      { username: req.currentUser?.username },
      {
        $pull: {
          school: {
            _id: mongoose.Types.ObjectId(req.params.schoolId)
          }
        }
      }
    )) as IUserDocument;
    userInfoQueue.addUserInfoJob('updateUserSchoolInCache', {
      key: `${req.currentUser?.userId}`,
      prop: 'school',
      value: null,
      type: 'remove',
      data: userData.school,
      paramId: req.params.schoolId
    });
    res.status(HTTP_STATUS.OK).json({ message: 'School deleted successfully', notification: true });
  }
}
