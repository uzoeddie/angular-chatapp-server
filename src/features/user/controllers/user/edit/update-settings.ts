import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { UserModel } from '@user/models/user.schema';
import { notificationSettingsSchema } from '@user/schemes/user/info';
import { userQueue } from '@queues/user.queue';
import { updateNotificationSettingInCache } from '@redis/user-cache';

export class Settings {
    @joiValidation(notificationSettingsSchema)
    public async update(req: Request, res: Response): Promise<void> {
        await UserModel.updateOne(
            { _id: req.currentUser?.userId }, 
            { $set: { notifications: req.body } },
            { upsert: true }
        );
        userQueue.addUserJob('updateNotificationPropInCache', { key: `${req.currentUser?.userId}`, prop: 'notifications', value: req.body });
        res.status(HTTP_STATUS.OK).json({ message: 'Notification settings updated successfully.', notification: true});
    }
}