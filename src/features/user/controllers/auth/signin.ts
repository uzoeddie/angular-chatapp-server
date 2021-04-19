import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import JWT from 'jsonwebtoken';
import { BadRequestError } from '@global/error-handler';
import { Helpers } from '@global/helpers';
import { UserModel } from '@user/models/user.schema';
import { IUserDocument } from '@user/interface/user.interface';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { loginSchema } from '@user/schemes/auth/login';
import { config } from '@root/config';

export class SignIn {
  @joiValidation(loginSchema)
  public async read(req: Request, res: Response): Promise<void> {
    const existingAuthUser: IUserDocument = (await UserModel.findOne({
      username: Helpers.firstLetterUppercase(req.body.username)
    }).exec()) as IUserDocument;
    if (!existingAuthUser) {
      throw new BadRequestError('Invalid credentials');
    }
    const passwordsMatch: boolean = await existingAuthUser.comparePassword(req.body.password);
    if (!passwordsMatch) {
      throw new BadRequestError('Invalid credentials');
    }
    const userJwt: string = JWT.sign(
      {
        userId: existingAuthUser!._id,
        uId: existingAuthUser!.uId,
        email: existingAuthUser!.email,
        username: existingAuthUser!.username,
        avatarColor: existingAuthUser!.avatarColor
      },
      config.JWT_TOKEN!
    );
    req.session = { jwt: userJwt };
    if (req.body.keepLoggedIn) {
      req.sessionOptions.maxAge = 30 * 24 * 60 * 60 * 1000;
    }
    res.status(HTTP_STATUS.OK).json({ message: 'User login successfully', user: existingAuthUser, token: userJwt, notification: false });
  }
}
