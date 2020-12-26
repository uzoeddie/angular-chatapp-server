import { Request, Response } from "express";
import HTTP_STATUS from 'http-status-codes';
import { NotificationModel } from "@notifications/models/notification.schema";

export class Delete {
    public async notification(req: Request, res: Response): Promise<void> {
        await NotificationModel.deleteOne({ _id: req.params.notificationId });
        res.status(HTTP_STATUS.OK).json({ message: 'Notification deleted successfully' }); 
    }
}