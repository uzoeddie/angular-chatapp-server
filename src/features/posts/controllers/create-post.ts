import { Request, Response } from 'express';
import { Query } from 'mongoose';
import HTTP_STATUS from 'http-status-codes';
import { uploads } from '@global/cloudinary-upload';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { ICreatePost, IPostDocument } from '@posts/interface/post.interface';
import { PostModel } from '@posts/models/post.schema';
import { addPostSchema, postWithImageSchema } from '@posts/schemes/post';
import { postQueue } from '@queues/post.queue';
import { UserModel } from '@user/models/user.schema';
import { IUserDocument } from '@user/interface/user.interface';
import { UploadApiResponse } from 'cloudinary';
import { ImageModel } from '@images/models/images.schema';

export class Create {
  @joiValidation(addPostSchema)
  public async post(req: Request, res: Response): Promise<void> {
    const { post, bgColor, feelings, privacy, gifUrl, profilePicture } = req.body;
    const createPost: ICreatePost = {
      userId: req.currentUser?.userId,
      username: req.currentUser?.username,
      email: req.currentUser?.email,
      avatarColor: req.currentUser?.avatarColor,
      profilePicture,
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl
    };
    const response: [IPostDocument, any, Pick<IUserDocument, any>] = await Promise.all([
      PostModel.create(createPost),
      UserModel.updateOne({ _id: req.currentUser?.userId }, { $inc: { postCount: 1, }}, { upsert: true }),
      UserModel.findOne({ _id: req.currentUser?.userId }).lean(),
    ]) as [IPostDocument, any, Pick<IUserDocument, any>];
    if (response) {
      response[0].reactions = [];
      postQueue.addPostJob('savePostsToRedisCache', { key: response[0]._id, uId: req.currentUser?.uId, value: response[0]});
      postQueue.addPostJob('updateUserPostCount', { key: req.currentUser?.userId, prop: 'postCount', value: response[2].postCount});
    }
    res.status(HTTP_STATUS.CREATED).json({ message: 'Post created successfully', notification: true});
  }

  @joiValidation(postWithImageSchema)
  public async postWithImage(req: Request, res: Response): Promise<void> {
    const { image, post, bgColor, feelings, privacy, gifUrl, profilePicture } = req.body;
    const result: UploadApiResponse = await uploads(image) as UploadApiResponse;
    const postWithImage = {
      userId: req.currentUser?.userId,
      username: req.currentUser?.username,
      email: req.currentUser?.email,
      avatarColor: req.currentUser?.avatarColor,
      profilePicture,
      bgColor,
      post,
      feelings,
      privacy,
      gifUrl,
      imgId: result.public_id,
      imgVersion: result.version.toString()
    };
    const createdPost: Promise<IPostDocument> = PostModel.create(postWithImage);
    const updatePostCount: Query<any> = UserModel.updateOne(
      { _id: req.currentUser?.userId }, { $inc: { postCount: 1 } }, { upsert: true }
    );
    const images: Query<any> = ImageModel.updateOne(
      { userId: req.currentUser?.userId }, 
      { 
        $push: { images: { imgId: result.public_id, imgVersion: result.version }}
      }, { upsert: true });
    const response: [IPostDocument, any, any] = await Promise.all([createdPost, updatePostCount, images]);
    if (response) {
      response[0].reactions = [];
      postQueue.addPostJob('savePostsToRedisCache', { key: response[0]._id, uId: req.currentUser?.uId, value: response[0]});
    }
    res.status(HTTP_STATUS.CREATED).json({ message: 'Post added with image successfully' });
  }
}
