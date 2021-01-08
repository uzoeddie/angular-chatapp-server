import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { uploads } from '@global/cloudinary-upload';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { editPostSchema, editPostWithImageSchema } from '@posts/schemes/post';
import { postQueue } from '@queues/post.queue';
import { UploadApiResponse } from 'cloudinary';
import { IPostDocument } from '@posts/interface/post.interface';
import { updatePostInRedisCache } from '@redis/post-cache';
import { socketIOPostObject } from '@sockets/posts';

export class Update {
  @joiValidation(editPostSchema)
  public async post(req: Request, res: Response): Promise<void> {
    const { post, bgColor, feelings, privacy, gifUrl, imgId, imgVersion, profilePicture } = req.body;
    const updatedPost: IPostDocument = {
      profilePicture,
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      imgId,
      imgVersion,
      createdAt: new Date()
    } as IPostDocument;
    const postUpdated: IPostDocument = await updatePostInRedisCache(req.params.postId, updatedPost);
    socketIOPostObject.emit('update post', postUpdated, 'posts');
    postQueue.addPostJob('updatePostInRedisCache', { key: req.params.postId, value: updatedPost });
    res.status(HTTP_STATUS.OK).json({ message: 'Post updated successfully', notification: true });
  }

  @joiValidation(editPostWithImageSchema)
  public async postWithImage(req: Request, res: Response): Promise<void> {
    const { image, post, bgColor, feelings, privacy, gifUrl, imgId, imgVersion, profilePicture } = req.body;
    if (imgId && imgVersion) {
      const postUpdated: IPostDocument = {
        profilePicture,
        post,
        bgColor,
        feelings,
        privacy,
        gifUrl,
        imgId,
        imgVersion,
        createdAt: new Date()
      } as IPostDocument;
      const updatedPost: IPostDocument = await updatePostInRedisCache(req.params.postId, postUpdated);
      socketIOPostObject.emit('update post', updatedPost, 'posts');
      postQueue.addPostJob('updatePostInRedisCache', { key: req.params.postId, value: postUpdated });
      res.status(HTTP_STATUS.OK).json({ message: 'Post updated successfully', notification: true });
      return;
    } else {
      const result: UploadApiResponse = (await uploads(image)) as UploadApiResponse;
      if (result) {
        const postUpdated: IPostDocument = {
          profilePicture,
          post,
          bgColor,
          feelings,
          privacy,
          gifUrl,
          imgId: result.public_id,
          imgVersion: result.version.toString(),
          createdAt: new Date()
        } as IPostDocument;
        const updatedPost: IPostDocument = await updatePostInRedisCache(req.params.postId, postUpdated);
        socketIOPostObject.emit('update post', updatedPost, 'posts');
        postQueue.addPostJob('updatePostInRedisCache', { key: req.params.postId, value: postUpdated });
        res.status(HTTP_STATUS.OK).json({ message: 'Post updated successfully', notification: true });
      }
    }
  }
}
