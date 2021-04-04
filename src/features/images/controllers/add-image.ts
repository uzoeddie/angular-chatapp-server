import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { uploads } from '@global/cloudinary-upload';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { addImageSchema, addBGImageSchema } from '@images/schemes/images';
import { UploadApiResponse } from 'cloudinary';
import { IUserDocument } from '@user/interface/user.interface';
import { updateSingleUserItemInRedisCache } from '@redis/user-info-cache';
import { imageQueue } from '@queues/image.queue';
import { socketIOImageObject } from '@sockets/images';

export class Add {
  @joiValidation(addImageSchema)
  public async image(req: Request, res: Response): Promise<void> {
    const result: UploadApiResponse = (await uploads(req.body.image, req.currentUser?.userId, true, true)) as UploadApiResponse;
    const url = `https://res.cloudinary.com/ratingapp/image/upload/${result.public_id}`;
    const cachedUser: IUserDocument = await updateSingleUserItemInRedisCache(`${req.currentUser?.userId}`, 'profilePicture', url);
    socketIOImageObject.emit('update user', cachedUser);
    imageQueue.addImageJob('updateImageInDB', {
      key: `${req.currentUser?.userId}`,
      value: url
    });
    res.status(HTTP_STATUS.CREATED).json({ message: 'Image added successfully', notification: true });
  }

  @joiValidation(addBGImageSchema)
  public async backgroundImage(req: Request, res: Response): Promise<void> {
    const result: UploadApiResponse = (await uploads(req.body.image)) as UploadApiResponse;
    const bgImageId: Promise<IUserDocument> = updateSingleUserItemInRedisCache(`${req.currentUser?.userId}`, 'bgImageId', result.public_id);
    const bgImageVersion: Promise<IUserDocument> = updateSingleUserItemInRedisCache(
      `${req.currentUser?.userId}`,
      'bgImageVersion',
      result.version
    );
    const response: [IUserDocument, IUserDocument] = await Promise.all([bgImageId, bgImageVersion]);
    socketIOImageObject.emit('insert image', {
      bgImageVersion: result.version,
      bgImageId: result.public_id,
      userId: response[0]
    });
    imageQueue.addImageJob('updateBGImageInDB', {
      key: `${req.currentUser?.userId}`,
      imgId: result.public_id,
      imgVersion: result.version.toString()
    });
    res.status(HTTP_STATUS.CREATED).json({ message: 'Image added successfully', notification: true });
  }
}
