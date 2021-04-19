import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { uploads } from '@global/cloudinary-upload';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { IPostDocument } from '@posts/interface/post.interface';
import { addPostSchema, postWithImageSchema } from '@posts/schemes/post';
import { postQueue } from '@queues/post.queue';
import { UploadApiResponse } from 'cloudinary';
import { postCache } from '@redis/post-cache';
import { ObjectID } from 'mongodb';
import { socketIOPostObject } from '@sockets/posts';

export class Create {
  @joiValidation(addPostSchema)
  public async post(req: Request, res: Response): Promise<void> {
    const { post, bgColor, privacy, gifUrl, profilePicture } = req.body;
    let { feelings } = req.body;
    const postObjectId: ObjectID = new ObjectID();
    if (!feelings) {
      feelings = {};
    }
    const createPost: IPostDocument = ({
      _id: postObjectId,
      userId: req.currentUser?.userId,
      username: req.currentUser?.username,
      email: req.currentUser?.email,
      avatarColor: req.currentUser?.avatarColor,
      profilePicture,
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      comments: 0,
      imgVersion: '',
      imgId: '',
      reactions: [],
      createdAt: new Date()
    } as unknown) as IPostDocument;
    await postCache.savePostsToRedisCache(
      `${createPost._id}`,
      `${req.currentUser?.userId}`,
      parseInt(req.currentUser!.uId, 10),
      createPost
    );
    socketIOPostObject.emit('post message', createPost, 'posts');
    delete createPost.reactions;
    postQueue.addPostJob('savePostsToDB', { key: req.currentUser?.userId, value: createPost });
    res.status(HTTP_STATUS.CREATED).json({ message: 'Post created successfully', notification: true });
  }

  @joiValidation(postWithImageSchema)
  public async postWithImage(req: Request, res: Response): Promise<void> {
    const { image, post, bgColor, privacy, gifUrl, profilePicture } = req.body;
    let { feelings } = req.body;
    const result: UploadApiResponse = (await uploads(image)) as UploadApiResponse;
    const postObjectId: ObjectID = new ObjectID();
    if (!feelings) {
      feelings = {};
    }
    const postWithImage: IPostDocument = ({
      _id: postObjectId,
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
      comments: 0,
      imgId: result.public_id,
      imgVersion: result.version.toString(),
      reactions: [],
      createdAt: new Date()
    } as unknown) as IPostDocument;
    await postCache.savePostsToRedisCache(
      `${postWithImage._id}`,
      `${req.currentUser?.userId}`,
      parseInt(req.currentUser!.uId, 10),
      postWithImage
    );
    socketIOPostObject.emit('post message', postWithImage, 'posts');
    delete postWithImage.reactions;
    postQueue.addPostJob('savePostsToDB', { key: req.currentUser?.userId, value: postWithImage });
    res.status(HTTP_STATUS.CREATED).json({ message: 'Post added with image successfully' });
  }
}
