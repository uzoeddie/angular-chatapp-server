import { Response } from 'express';
import { AuthPayload } from '@user/interface/user.interface';
import { IJwt } from './auth.mock';
import { IMessage } from '@mock/chat.mock';
import { IFileImageDocument } from '@images/interface/images.interface';

export const imagesMockRequest = (sessionData: IJwt, body: IMessage, currentUser?: AuthPayload | null, params?: IParams) => ({
  session: sessionData,
  body,
  params,
  currentUser
});

export const imagesMockResponse = (): Response => {
  const res: Response = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

export interface IParams {
  followerId?: string;
  userId?: string;
  imageId?: string;
}

export const fileDocument: IFileImageDocument = {
  userId: '60263f14648fed5246e322d9',
  bgImageVersion: '',
  bgImageId: '',
  profilePicture: '',
  images: [
    {
      imgVersion: '',
      imgId: '',
      createdAt: new Date(),
      _id: '60263f14642ded5246e322d9'
    }
  ]
} as IFileImageDocument;
