import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import JWT from 'jsonwebtoken';

import { NotAuthorizedError } from '@global/error-handler';
import { Helpers } from '@global/helpers';
import { UserModel } from '@user/models/user.schema';
import { IUserDocument } from '@user/interface/user.interface';
import { saveUserToRedisCache } from '@redis/user-cache';
import { config } from '@root/config';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { signupSchema } from '@user/schemes/auth/signup';

const MAX = 10000;

export class SignUp {
  @joiValidation(signupSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { username, email, password } = req.body as IUserDocument;
    const checkIfUserExist: IUserDocument = (await UserModel.findOne({
      username: Helpers.firstLetterUppercase(username),
      email: Helpers.lowerCase(email)
    }).exec()) as IUserDocument;
    if (checkIfUserExist) {
      throw new NotAuthorizedError('User with details already exists.');
    }
    const uId: number = Math.floor(Math.random() * Math.floor(MAX));
    const body: IUserDocument = {
      username: Helpers.firstLetterUppercase(username),
      uId,
      email: Helpers.lowerCase(email),
      password,
      avatarColor: Helpers.avatarColor()
    } as IUserDocument;

    const createdAuthUser: IUserDocument = await UserModel.create(body);
    const userJwt: string = JWT.sign(
      {
        userId: createdAuthUser._id,
        uId: createdAuthUser.uId,
        email: createdAuthUser.email,
        username: createdAuthUser.username,
        avatarColor: createdAuthUser.avatarColor
      },
      config.JWT_TOKEN!
    );
    // req.session = { jwt: userJwt };

    await saveUserToRedisCache(createdAuthUser._id, uId, createdAuthUser);
    res.status(HTTP_STATUS.CREATED).json({ message: 'User created successfully', user: createdAuthUser, token: userJwt });
  }
}
