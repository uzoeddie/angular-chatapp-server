import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { Helpers } from '@global/helpers';
import { UserModel } from '@user/models/user.schema';
import { ISearchUser } from '@chat/interface/chat.interface';
export class Search {
  public async users(req: Request, res: Response): Promise<void> {
    const regex = new RegExp(Helpers.escapeRegex(req.params.query), 'i');
    const users: ISearchUser[] = await UserModel.aggregate([
      { $match: { username: regex } },
      {
        $project: {
          _id: 1,
          username: 1,
          email: 1,
          avatarColor: 1,
          profilePicture: 1
        }
      }
    ]);
    res.status(HTTP_STATUS.OK).json({ message: 'Search results', search: users });
  }
}
