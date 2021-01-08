import { Request, Response } from 'express';
import { UpdateQuery } from 'mongoose';
import HTTP_STATUS from 'http-status-codes';
import { uploads } from '@global/cloudinary-upload';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { ImageModel } from '@images/models/images.schema';
import { addImageSchema, addBGImageSchema } from '@images/schemes/images';
import { userInfoQueue } from '@queues/user-info.queue';
import { UserModel } from '@user/models/user.schema';
import { UploadApiResponse } from 'cloudinary';
import { IUserDocument } from '@user/interface/user.interface';
import { IFileImageDocument } from '@images/interface/images.interface';
import { userQueue } from '@queues/user.queue';

export class Add {
  @joiValidation(addImageSchema)
  public async image(req: Request, res: Response): Promise<void> {
    const { image }: { image: string } = req.body;
    const result: UploadApiResponse = (await uploads(image, req.currentUser?.userId, true, true)) as UploadApiResponse;
    const url = `https://res.cloudinary.com/ratingapp/image/upload/${result.public_id}`;
    const setUserImage: UpdateQuery<IUserDocument> = await UserModel.updateOne({ _id: req.currentUser?.userId }, { $set: { profilePicture: url } }).exec();
    if (setUserImage) {
      userQueue.addUserJob('updateImageInCache', {
        key: `${req.currentUser?.userId}`,
        prop: 'profilePicture',
        value: url
      });
    }
    res.status(HTTP_STATUS.CREATED).json({ message: 'Image added successfully', notification: true });
  }

  @joiValidation(addBGImageSchema)
  public async backgroundImage(req: Request, res: Response): Promise<void> {
    const { image }: { image: string } = req.body;
    const result: UploadApiResponse = (await uploads(image)) as UploadApiResponse;
    const images: UpdateQuery<IFileImageDocument> = ImageModel.updateOne(
      { userId: req.currentUser?.userId },
      {
        $push: { images: { imgId: result.public_id, imgVersion: result.version.toString() } },
        $set: { bgImageId: result.public_id, bgImageVersion: result.version.toString() }
      },
      { upsert: true }
    );
    const backgroundImage: UpdateQuery<IUserDocument> = UserModel.updateOne({ _id: req.currentUser?.userId }, { $set: { bgImageId: result.public_id, bgImageVersion: result.version } });
    const response: [UpdateQuery<IFileImageDocument>, UpdateQuery<IUserDocument>] = await Promise.all([images, backgroundImage]);
    if (response) {
      userQueue.addUserJob('updateImageInCache', {
        key: `${req.currentUser?.userId}`,
        prop: 'bgImageId',
        value: result.public_id
      });
      userQueue.addUserJob('updateImageInCache', {
        key: `${req.currentUser?.userId}`,
        prop: 'bgImageVersion',
        value: result.version
      });
    }
    res.status(HTTP_STATUS.CREATED).json({ message: 'Image added successfully', notification: true });
  }
}
