import { Request, Response } from "express";
import { Query } from "mongoose"; 
import HTTP_STATUS from 'http-status-codes';
import { uploads } from "@global/cloudinary-upload";
import { joiValidation } from "@global/decorators/joi-validation.decorator";
import { ImageModel } from "@images/models/images.schema";
import { addImageSchema, addBGImageSchema } from "@images/schemes/images";
import { userInfoQueue } from "@queues/user-info.queue";
import { UserModel } from "@user/models/user.schema";
import { UploadApiResponse } from "cloudinary";

export class Add {
    @joiValidation(addImageSchema)
    public async image(req: Request, res: Response): Promise<void> {
        const { image, type }: { image: string, type: string } = req.body;
        const result: UploadApiResponse = await uploads(image, req.currentUser?.userId, true, true) as UploadApiResponse;
        const url: string = `https://res.cloudinary.com/ratingapp/image/upload/${result.public_id}`;
        const setUserImage = await UserModel.updateOne(
            { _id: req.currentUser?.userId },
            { $set: { profilePicture: url } }
        ).exec();

        if (setUserImage) {
            userInfoQueue.addUserInfoJob('updateImageInCache', 
                { key: `${req.currentUser?.userId}`, prop: 'profilePicture', value: url }, 
            );
        }
        res.status(HTTP_STATUS.CREATED).json({ message: 'Image added successfully', notification: true });
    }

    @joiValidation(addBGImageSchema)
    public async backgroundImage(req: Request, res: Response): Promise<void> {
        const { image }: { image: string } = req.body;
        const result: UploadApiResponse = await uploads(image) as UploadApiResponse;
        const images: Query<any> = ImageModel.updateOne(
            { userId: req.currentUser?.userId }, 
            { 
                $push: { images: { imgId: result.public_id, imgVersion: result.version }},
                $set: { bgImageId: result.public_id, bgImageVersion: result.version }
            }, { upsert: true });

        const backgroundImage: Query<any> = UserModel.updateOne(
            { _id: req.currentUser?.userId },
            { $set: { bgImageId: result.public_id, bgImageVersion: result.version }}
        );
        
        const response: [any, any] = await Promise.all([images, backgroundImage]);
        if (response) {
            userInfoQueue.addUserInfoJob('updateImageInCache', 
                { key: `${req.currentUser?.userId}`, prop: 'bgImageId', value: result.public_id }, 
            );
            userInfoQueue.addUserInfoJob('updateImageInCache', 
                { key: `${req.currentUser?.userId}`, prop: 'bgImageVersion', value: result.version }, 
            );
        }
        res.status(HTTP_STATUS.CREATED).json({ message: 'Image added successfully', notification: true });
    }
}