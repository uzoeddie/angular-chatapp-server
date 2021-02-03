import { IFollowerDocument } from '@followers/interface/followers.interface';
import { FollowerModel } from '@followers/models/follower.schema';
import { NotificationModel } from '@notifications/models/notification.schema';
import { socketIONotificationObject } from '@sockets/notifications';
import { IUserDocument } from '@user/interface/user.interface';
import { UserModel } from '@user/models/user.schema';
import { BulkWriteOpResultObject, ObjectID, ObjectId } from 'mongodb';
import mongoose from 'mongoose';

class Follower {
  public async addFollowerToDB(userId: string, followerId: string, username: string, followerDocumentId: ObjectID): Promise<void> {
    const followerObjectId: ObjectId = mongoose.Types.ObjectId(followerId);
    const userObjectId: ObjectId = mongoose.Types.ObjectId(userId);

    const following: Promise<IFollowerDocument> = FollowerModel.create({
      _id: followerDocumentId,
      followerId: userObjectId,
      followeeId: followerObjectId
    });

    const users: Promise<BulkWriteOpResultObject> = UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: userId },
          update: { $inc: { followingCount: 1 } }
        }
      },
      {
        updateOne: {
          filter: { _id: followerId },
          update: { $inc: { followersCount: 1 } }
        }
      }
    ]);
    const response: [IFollowerDocument, BulkWriteOpResultObject, IUserDocument | null] = await Promise.all([following, users, UserModel.findOne({ _id: followerId })]);

    if (response[2]!.notifications.follows && userId !== followerId) {
      const notificationModel = new NotificationModel();
      const notifications = await notificationModel.insertNotification({
        userFrom: userId,
        userTo: followerId,
        message: `${username} is now following you.`,
        notificationType: 'follows',
        entityId: userId,
        createdItemId: response[0]._id
      });
      socketIONotificationObject.emit('insert notification', notifications, { userTo: followerId });
    }
  }

  public async unfollowerFromDB(userId: string, followerId: string): Promise<void> {
    const followerObjectId: ObjectId = mongoose.Types.ObjectId(followerId);
    const userObjectId: ObjectId = mongoose.Types.ObjectId(userId);

    const unFollowing = FollowerModel.deleteOne({ followerId: userObjectId, followeeId: followerObjectId });
    const users: Promise<BulkWriteOpResultObject> = UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: userId },
          update: { $inc: { followingCount: -1 } }
        }
      },
      {
        updateOne: {
          filter: { _id: followerId },
          update: { $inc: { followersCount: -1 } }
        }
      }
    ]);

    await Promise.all([unFollowing, users]);
  }
}

export const followerService: Follower = new Follower();
