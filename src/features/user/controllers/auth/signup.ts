import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import JWT from 'jsonwebtoken';
import { ObjectID } from 'mongodb';
import { NotAuthorizedError } from '@global/error-handler';
import { Helpers } from '@global/helpers';
import { UserModel } from '@user/models/user.schema';
import { IUserDocument } from '@user/interface/user.interface';
import { saveUserToRedisCache } from '@redis/user-cache';
import { config } from '@root/config';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { signupSchema } from '@user/schemes/auth/signup';
import { userQueue } from '@queues/user.queue';
import Jimp from 'jimp';
import { uploads } from '@global/cloudinary-upload';

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
    const uId = `${Math.floor(Math.random() * Math.floor(MAX))}${Date.now()}`;
    const createdObjectId: ObjectID = new ObjectID();
    const data: IUserDocument = ({
      _id: createdObjectId,
      uId,
      username: Helpers.firstLetterUppercase(username),
      email: Helpers.lowerCase(email),
      avatarColor: Helpers.avatarColor(),
      password,
      birthDay: { month: '', day: '' },
      postCount: 0,
      gender: '',
      quotes: '',
      about: '',
      relationship: '',
      blocked: [],
      blockedBy: [],
      bgImageVersion: '',
      bgImageId: '',
      work: [],
      school: [],
      placesLived: [],
      createdAt: new Date(),
      followersCount: 0,
      followingCount: 0,
      notifications: {
        messages: true,
        reactions: true,
        comments: true,
        follows: true
      },
      profilePicture: `https://res.cloudinary.com/ratingapp/image/upload/${createdObjectId}`
    } as unknown) as IUserDocument;

    const image: Jimp = await new Jimp(256, 256, data.avatarColor);
    const font = await Jimp.loadFont(Jimp.FONT_SANS_128_WHITE);
    image.print(
      font,
      65,
      70,
      {
        text: data.username.charAt(0),
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
      },
      image.bitmap.width / 2,
      image.bitmap.height / 2
    );
    const dataFile: string = await image.getBase64Async('image/png');
    await Promise.all([uploads(dataFile, `${createdObjectId}`, true, true), saveUserToRedisCache(`${createdObjectId}`, uId, data)]);
    userQueue.addUserJob('addUserToDB', data);
    const userJwt: string = JWT.sign(
      {
        userId: data._id,
        uId: data.uId,
        email: data.email,
        username: data.username,
        avatarColor: data.avatarColor
      },
      config.JWT_TOKEN!
    );
    req.session = { jwt: userJwt };
    if (req.body.keepLoggedIn) {
      req.sessionOptions.maxAge = 30 * 24 * 60 * 60 * 1000;
    }
    res.status(HTTP_STATUS.CREATED).json({ message: 'User created successfully', user: data, token: userJwt });
  }
}
