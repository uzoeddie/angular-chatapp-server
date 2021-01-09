import { IFileImageDocument } from '@images/interface/images.interface';
import { ImageModel } from '@images/models/images.schema';
import { IUserDocument } from '@user/interface/user.interface';
import { UserModel } from '@user/models/user.schema';
import { UpdateQuery } from 'mongoose';
import mongoose from 'mongoose';

class Image {
  public async addImageToDB(userId: string, url: string): Promise<void> {
    await UserModel.updateOne({ _id: userId }, { $set: { profilePicture: url } }).exec();
  }

  public async addBackgroundImageToDB(userId: string, imgId: string, imgVersion: string): Promise<void> {
    const images: UpdateQuery<IFileImageDocument> = ImageModel.updateOne(
      { userId },
      {
        $push: { images: { imgId, imgVersion } },
        $set: { bgImageId: imgId, bgImageVersion: imgVersion }
      },
      { upsert: true }
    );
    const backgroundImage: UpdateQuery<IUserDocument> = UserModel.updateOne({ _id: userId }, { $set: { bgImageId: imgId, bgImageVersion: imgVersion } });
    await Promise.all([images, backgroundImage]);
  }

  public async removeImageFromDB(userId: string, imageId: string): Promise<void> {
    await ImageModel.updateOne(
      { userId },
      {
        $pull: {
          images: {
            _id: mongoose.Types.ObjectId(imageId)
          }
        }
      }
    );
  }
}

export const imageService: Image = new Image();
