import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

import { UserModel } from '@user/models/user.schema';
import { userInfoQueue } from '@queues/user-info.queue';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { aboutSchema, quotesSchema } from '@user/schemes/user/info';

export class AddDetails {
    @joiValidation(aboutSchema)
    public async about(req: Request, res: Response): Promise<void> {
        await UserModel.updateOne(
            { username: req.currentUser?.username },
            { $set: { about: req.body.about } }
        );
        userInfoQueue.addUserInfoJob('updateAboutInfoInCache', { key: `${req.currentUser?.userId}`, prop: 'about', value: req.body.about });
        res.status(HTTP_STATUS.OK).json({ message: 'About you updated successfully' });
    }

    @joiValidation(quotesSchema)
    public async quotes(req: Request, res: Response): Promise<void> {
        await UserModel.updateOne(
            { username: req.currentUser?.username },
            { $set: { quotes: req.body.quotes } }
        );
        userInfoQueue.addUserInfoJob('updateQuotesInCache', { key: `${req.currentUser?.userId}`, prop: 'quotes', value: req.body.quotes });
        res.status(HTTP_STATUS.OK).json({ message: 'Quotes updated successfully' });
    }
}