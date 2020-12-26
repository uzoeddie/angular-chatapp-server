import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import mongoose from 'mongoose';
import { FollowerModel } from '@followers/models/follower.schema';
import { followerQueue } from '@queues/follower.queue';
import { userQueue } from '@queues/user.queue';
import { UserModel } from '@user/models/user.schema';
import { NotificationModel } from '@notifications/models/notification.schema';
import { IFollowerDocument } from '@followers/interface/followers.interface';
import { IUserDocument } from '@user/interface/user.interface';
import { BulkWriteOpResultObject, ObjectId } from 'mongodb';

export class Add {
  public async follower(req: Request, res: Response): Promise<void> {
    const followerObjectId: ObjectId = mongoose.Types.ObjectId(req.params.followerId);
    const userObjectId: ObjectId = mongoose.Types.ObjectId(req.currentUser?.userId);

    const following: Promise<IFollowerDocument> = FollowerModel.create({
      followerId: userObjectId,
      followeeId: followerObjectId
    });

    const users: Promise<BulkWriteOpResultObject> = UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: req.currentUser?.userId },
          update: { $inc: { followingCount: 1 }} 
        }
      },
      {
        updateOne: {
          filter: { _id: req.params.followerId },
          update: { $inc: { followersCount: 1 }}
        }
      },
    ]);
    const response: [IFollowerDocument, BulkWriteOpResultObject, IUserDocument] = await Promise.all(
      [following, 
        users, 
        UserModel.findOne({ _id: req.params.followerId })
      ]) as [IFollowerDocument, BulkWriteOpResultObject, IUserDocument];
    if (response[2]!.notifications.follows) {
      NotificationModel.schema.methods.insertNotification({ 
        userFrom: req.currentUser?.userId, 
        userTo: req.params.followerId, 
        message: `${req.currentUser?.username} is now following you.`, 
        notificationType: 'follows',
        entityId: req.currentUser?.userId,
        createdItemId: response[0]._id
      });
    }
    if (response) {
      userQueue.addUserJob('updateUserFollowersInCache', { key: `${req.params.followerId}`, prop: 'followersCount', value: 1 });
      userQueue.addUserJob('updateUserFollowersInCache', { key: `${req.currentUser?.userId}`, prop: 'followingCount', value: 1 });
      followerQueue.addFollowerJob('addFollowerToCache', { key: `${req.currentUser?.userId}`, value: `${req.params.followerId}` });
    }
    res.status(HTTP_STATUS.OK).json({ message: `Following user now`, notification: true });
  }
}
