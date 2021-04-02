import { AuthPayload } from '@user/interface/user.interface';
import { Response } from 'express';

export const postMockRequest = (body: IBody, currentUser?: AuthPayload | null, params?: any) => ({
  body,
  params,
  currentUser
});

export const postMockResponse = (): Response => {
  const res: Response = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

interface IBody {
  bgColor: string;
  post?: string;
  gifUrl?: string;
  image?: string;
  privacy?: IPostPrivacy;
  imgId?: string;
  imgVersion?: string;
  profilePicture?: string;
  feelings?: { name: string; file: string };
}

type Privacy = 'Public' | 'Followers' | 'Private';
interface IPostPrivacy {
  type: Privacy | string;
  iconName: string;
}

export const newPost: IBody = {
  bgColor: '#f44336',
  post: 'how are you?',
  gifUrl: '',
  imgId: '',
  imgVersion: '',
  image: 'testing image',
  privacy: { type: 'Public', iconName: 'fas fa-globe dropdown-icon' },
  profilePicture: 'https://res.cloudinary.com/ratingapp/image/upload/602740b43eaf201998cd9297',
  feelings: { name: 'happy', file: '/assets/feelings/happy.jpg' }
};

export const postMockData = {
  avatarColor: '#4caf50',
  bgColor: '#f44336',
  comments: '3',
  createdAt: new Date(),
  email: 'danny@me.com',
  feelings: { name: 'happy', file: '/assets/feelings/happy.jpg' },
  gifUrl: '',
  imgId: '',
  imgVersion: '',
  post: 'how are you?',
  privacy: { type: 'Public', iconName: 'fas fa-globe dropdown-icon' },
  profilePicture: 'https://res.cloudinary.com/ratingapp/image/upload/602740b43eaf201998cd9297',
  reactions: [{ type: 'love', value: 1 }],
  userId: '602740b43eaf201998cd9297',
  username: 'Danny',
  _id: '6027f77087c9d9ccb1555268'
};
