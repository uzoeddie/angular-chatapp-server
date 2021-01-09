import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { notificationSettingsSchema } from '@user/schemes/user/info';
import { userQueue } from '@queues/user.queue';
import { updateNotificationSettingInCache } from '@redis/user-cache';

export class Settings {
  @joiValidation(notificationSettingsSchema)
  public async update(req: Request, res: Response): Promise<void> {
    await updateNotificationSettingInCache(`${req.currentUser?.userId}`, 'notifications', req.body);
    userQueue.addUserJob('updateNotificationSettings', {
      key: `${req.currentUser?.username}`,
      value: req.body
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Notification settings updated successfully.', notification: true });
  }
}
