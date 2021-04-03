/* eslint-disable @typescript-eslint/no-explicit-any */
import { BulkWriteOpResultObject, ObjectID, ObjectId } from 'mongodb';
import mongoose, { Query } from 'mongoose';
import { IFollowerDocument } from '@followers/interface/followers.interface';
import { FollowerModel } from '@followers/models/follower.schema';
import { INotificationDocument } from '@notifications/interface/notification.interface';
import { NotificationModel } from '@notifications/models/notification.schema';
import { socketIONotificationObject } from '@sockets/notifications';
import { IUserDocument } from '@user/interface/user.interface';
import { UserModel } from '@user/models/user.schema';
import { notificationTemplate } from '@email/templates/notification/notification-template';
import { emailQueue } from '@queues/email.queue';

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

    if (userId !== followerId) {
      const notificationModel: INotificationDocument = new NotificationModel();
      const notifications: void = await notificationModel.insertNotification({
        userFrom: userId,
        userTo: followerId,
        message: `${username} is now following you.`,
        notificationType: 'follows',
        entityId: userId,
        createdItemId: response[0]._id
      });
      socketIONotificationObject.emit('insert notification', notifications, { userTo: followerId });
    }

    if (response[2]!.notifications.follows && userId !== followerId) {
      const templateParams = {
        username: response[2]!.username,
        message: `${username} is now following you.`,
        header: 'Follower Notification'
      };
      const template: string = notificationTemplate.notificationMessageTemplate(templateParams);
      emailQueue.addEmailJob('followersMail', { receiverEmail: response[2]!.email, template, type: `${username} is now following you.` });
    }
  }

  public async unfollowerFromDB(userId: string, followerId: string): Promise<void> {
    const followerObjectId: ObjectId = mongoose.Types.ObjectId(followerId);
    const userObjectId: ObjectId = mongoose.Types.ObjectId(userId);

    const unFollowing: Query<any, IFollowerDocument> = FollowerModel.deleteOne({ followerId: userObjectId, followeeId: followerObjectId });
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
