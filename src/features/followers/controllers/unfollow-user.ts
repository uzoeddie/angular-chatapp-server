import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import mongoose, { Query } from 'mongoose';
import { FollowerModel } from '@followers/models/follower.schema';
import { followerQueue } from '@queues/follower.queue';
import { userQueue } from '@queues/user.queue';
import { UserModel } from '@user/models/user.schema';
import { BulkWriteOpResultObject, ObjectId } from 'mongodb';

export class Remove {
  public async following(req: Request, res: Response): Promise<void> {
    const followerObjectId: ObjectId = mongoose.Types.ObjectId(req.params.followerId);
    const userObjectId: ObjectId = mongoose.Types.ObjectId(req.currentUser?.userId);

    const unFollowing: Query<any> = FollowerModel.deleteOne({ followerId: userObjectId, followeeId: followerObjectId });
    const users: Promise<BulkWriteOpResultObject> = UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: req.currentUser?.userId },
          update: { $inc: { followingCount: -1 }} 
        }
      },
      {
        updateOne: {
          filter: { _id: req.params.followerId },
          update: { $inc: { followersCount: -1 }}
        }
      },
    ]);

    const response: [any, BulkWriteOpResultObject] = await Promise.all([unFollowing, users]);
    if (response) {
      userQueue.addUserJob('updateUserFollowersInCache', { key: `${req.params.followerId}`, prop: 'followersCount', value: -1 });
      userQueue.addUserJob('updateUserFollowersInCache', { key: `${req.currentUser?.userId}`, prop: 'followingCount', value: -1 });
      followerQueue.addFollowerJob('removeFollowerFromCache', { key: `${req.currentUser?.userId}`, value: `${req.params.followerId}` });
    }
    res.status(HTTP_STATUS.OK).json({ message: 'Unfollowed user now' });
  }
}
