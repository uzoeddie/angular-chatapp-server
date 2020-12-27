import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import mongoose from 'mongoose';
import { userQueue } from '@queues/user.queue';
import { UserModel } from '@user/models/user.schema';

export class Block {
  public async follower(req: Request, res: Response): Promise<void> {
    UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: req.currentUser?.userId, blocked: { $ne: mongoose.Types.ObjectId(req.params.followerId) } },
          update: {
            $push: {
              blocked: mongoose.Types.ObjectId(req.params.followerId)
            }
          }
        }
      },
      {
        updateOne: {
          filter: { _id: req.params.followerId, blockedBy: { $ne: mongoose.Types.ObjectId(req.currentUser?.userId) } },
          update: {
            $push: {
              blockedBy: mongoose.Types.ObjectId(req.currentUser?.userId)
            }
          }
        }
      }
    ])
      .then(() => {
        res.status(HTTP_STATUS.OK).json({ message: 'User blocked' });
      })
      .then(() => {
        userQueue.addUserJob('updateBlockedUserPropInCache', {
          key: `${req.params.followerId}`,
          prop: 'blockedBy',
          value: `${req.currentUser?.userId}`,
          type: 'block'
        });
        userQueue.addUserJob('updateBlockedUserPropInCache', {
          key: `${req.currentUser?.userId}`,
          prop: 'blocked',
          value: `${req.params.followerId}`,
          type: 'block'
        });
      });
  }

  public async unblockFollower(req: Request, res: Response): Promise<void> {
    UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: req.currentUser?.userId },
          update: {
            $pull: {
              blocked: mongoose.Types.ObjectId(req.params.followerId)
            }
          }
        }
      },
      {
        updateOne: {
          filter: { _id: req.params.followerId },
          update: {
            $pull: {
              blockedBy: mongoose.Types.ObjectId(req.currentUser?.userId)
            }
          }
        }
      }
    ])
      .then(() => {
        res.status(HTTP_STATUS.OK).json({ message: 'User unblocked' });
      })
      .then(() => {
        userQueue.addUserJob('updateBlockedUserPropInCache', {
          key: `${req.params.followerId}`,
          prop: 'blockedBy',
          value: `${req.currentUser?.userId}`,
          type: 'unblock'
        });
        userQueue.addUserJob('updateBlockedUserPropInCache', {
          key: `${req.currentUser?.userId}`,
          prop: 'blocked',
          value: `${req.params.followerId}`,
          type: 'unblock'
        });
      });
  }
}
