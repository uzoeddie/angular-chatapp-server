import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

export class SignOut {
    public async update(req: Request, res: Response): Promise<void> {
        // req.session = null;
        req.headers.authorization = undefined;
        res.status(HTTP_STATUS.OK).json({ message: 'Logout successful', user: {}, token: '' });
    }
}