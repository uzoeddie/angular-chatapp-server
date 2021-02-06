import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { NotificationModel } from '@notifications/models/notification.schema';
import { INotificationDocument } from '@notifications/interface/notification.interface';

export class Get {
  public async notification(req: Request, res: Response): Promise<void> {
    const notifications: INotificationDocument[] = (await NotificationModel.find({ userTo: req.currentUser?.userId }).lean().populate({ path: 'userFrom', select: 'username avatarColor uId profilePicture' }).sort({ date: -1 })) as INotificationDocument[];
    res.status(HTTP_STATUS.OK).json({ message: 'User notifications', notifications });
  }
}
