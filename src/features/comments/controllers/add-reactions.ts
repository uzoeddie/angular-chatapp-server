import { Request, Response } from "express";
import HTTP_STATUS from 'http-status-codes';
import { ReactionsModel } from "@comments/models/reactions.schema";
import { reactionsSchema } from "@comments/schemes/comments";
import { joiValidation } from "@global/decorators/joi-validation.decorator";
import { PostModel } from "@posts/models/post.schema";
import { postQueue } from "@queues/post.queue";
import { getUserFromCache } from "@redis/user-cache";
import { NotificationModel } from "@notifications/models/notification.schema";

export class AddReaction {
    @joiValidation(reactionsSchema)
    public async reaction(req: Request, res: Response): Promise<void> {
        const { userTo, postId, type, previousReaction } = req.body;
        const updatedReaction: any[] = await Promise.all([
            getUserFromCache(req.body.userTo),
            ReactionsModel.deleteOne({ postId, type: previousReaction, username: req.currentUser?.username }),
            ReactionsModel.create({
                userTo,
                postId,
                type,
                username: req.currentUser?.username,
                avatarColor: req.currentUser?.avatarColor,
                profilePicture: req.body.profilePicture,
            }),
            PostModel.updateOne(
                { _id: postId }, 
                { $inc: { [`reactions.${previousReaction}`]: -1  }}
            ),
            PostModel.updateOne(
                { _id: postId }, 
                { $inc: { [`reactions.${type}`]: 1  }}
            ),
            PostModel.findOne({ _id: postId }).lean()
        ]);
        if (updatedReaction[0].notifications.reactions) {
            NotificationModel.schema.methods.insertNotification({ 
                userFrom: req.currentUser?.userId, 
                userTo, 
                message: `${req.currentUser?.username} reacted to your post.`, 
                notificationType: 'reactions',
                entityId: postId,
                createdItemId: updatedReaction[2]._id
            });
        }
        if (updatedReaction) {
            postQueue.addPostJob('updateSinglePostInRedis', { type: 'reactions', key: postId, value: updatedReaction[5]?.reactions });
        }
        res.status(HTTP_STATUS.OK).json({ message: 'Like added to post successfully', notification: true });
    }
}