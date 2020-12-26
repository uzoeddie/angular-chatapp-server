import { Request, Response } from "express";
import HTTP_STATUS from 'http-status-codes';
import { uploads } from "@global/cloudinary-upload";
import { joiValidation } from "@global/decorators/joi-validation.decorator";
import { PostModel } from "@posts/models/post.schema";
import { editPostSchema, editPostWithImageSchema } from "@posts/schemes/post";
import { postQueue } from "@queues/post.queue";
import { UploadApiResponse } from "cloudinary";
import { ImageModel } from "@images/models/images.schema";
import { Query } from "mongoose";

export class Update {
    @joiValidation(editPostSchema)
    public async post(req: Request, res: Response): Promise<void> {
        const { post, bgColor, feelings, privacy, gifUrl, imgId, imgVersion, profilePicture } = req.body;
        const updatedPost = {
            profilePicture,
            post,
            bgColor,
            feelings,
            privacy,
            gifUrl,
            imgId,
            imgVersion,
            createdAt: new Date(),
        }
    
        const updatePost = await PostModel.updateOne(
            { _id: req.params.postId },
            { $set: updatedPost }
        );

        if(updatePost) {
            postQueue.addPostJob('updatePostInRedisCache', { key: req.params.postId, value: updatedPost });
        }
        res.status(HTTP_STATUS.OK).json({ message: 'Post updated successfully', notification: true });
    }
    
    @joiValidation(editPostWithImageSchema)
    public async postWithImage(req: Request, res: Response): Promise<void> {
        const { image, post, bgColor, feelings, privacy, gifUrl, imgId, imgVersion, profilePicture } = req.body;
        if (imgId && imgVersion) {
            const postUpdated = {
                profilePicture,
                post,
                bgColor,
                feelings,
                privacy,
                gifUrl,
                imgId,
                imgVersion,
                createdAt: new Date(),
            }
            const updatePost = await PostModel.updateOne(
                { _id: req.params.postId },
                { $set: postUpdated }
            );
            if(updatePost) {
                postQueue.addPostJob('updatePostInRedisCache', { key: req.params.postId, value: postUpdated });
            }
            res.status(HTTP_STATUS.OK).json({ message: 'Post updated successfully', notification: true});
            return;
        } else {
            const result: UploadApiResponse = await uploads(image) as UploadApiResponse;
            if (result) {
                const postUpdated = {
                    profilePicture,
                    post,
                    bgColor,
                    feelings,
                    privacy,
                    gifUrl,
                    imgId: result.public_id,
                    imgVersion: result.version.toString(),
                    createdAt: new Date(),
                }
                const updatedPost = PostModel.updateOne(
                    { _id: req.params.postId },
                    { $set: postUpdated }
                );
                const images: Query<any> = ImageModel.updateOne(
                    { userId: req.currentUser?.userId }, 
                    { 
                      $push: { images: { imgId: result.public_id, imgVersion: result.version }}
                    }, { upsert: true }
                );    
                await Promise.all([updatedPost, images]);
                postQueue.addPostJob('updatePostInRedisCache', { key: req.params.postId, value: postUpdated });
                res.status(HTTP_STATUS.OK).json({ message: 'Post updated successfully', notification: true});
            }
        }
    
        
    }
}