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
    const passwordsMatch: boolean = await existingAuthUser!.comparePassword(req.body.password);
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
    // let session: any = req.session;
    // session.jwt = userJwt;
    // req.session = session;
    // res.cookie('userId', userJwt);
    res.status(HTTP_STATUS.OK).json({ message: 'User login successfully', user: existingAuthUser, token: userJwt });
  }
}

// async function preventTimingAttack(password: string): Promise<void> {
//     const dummyHash: string = '$2b$14$MdkJ8AVAQsN2GkhitG1lHU.MdkJ8AVAQsN2GkhitG1lHUlSVsKSnG';
//     await compare(password, dummyHash);
// }
