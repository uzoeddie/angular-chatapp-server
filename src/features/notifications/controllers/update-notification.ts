import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { NotificationModel } from '@notifications/models/notification.schema';

export class Update {
  public async notification(req: Request, res: Response): Promise<void> {
    await NotificationModel.updateOne({ _id: req.params.notificationId }, { $set: { read: true } });
    res.status(HTTP_STATUS.OK).json({ message: 'Notification marked as read', notification: false });
  }
}
