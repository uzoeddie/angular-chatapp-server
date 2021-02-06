/* eslint-disable @typescript-eslint/no-explicit-any */
import { Aggregate, Query } from 'mongoose';
import { ICommentDocument, IFormattedReactions, IReactionDocument, IReactions } from '@comments/interface/comment.interface';
import { CommentsModel } from '@comments/models/comment.schema';
import { ReactionsModel } from '@comments/models/reactions.schema';
import { IPostDocument } from '@posts/interface/post.interface';
import { PostModel } from '@posts/models/post.schema';
import { MessageModel } from '@chat/models/chat.schema';
import { IChatMessage } from '@chat/interface/chat.interface';

export class Helpers {
  static firstLetterUppercase(str: string): string {
    const valueStr = str.toLowerCase();
    return `${valueStr.charAt(0).toUpperCase()}${valueStr.slice(1)}`;
  }

  static lowerCase(str: string): string {
    return str.toLowerCase();
  }

  static avatarColor(): string {
    const colors = ['#f44336', '#e91e63', '#2196f3', '#9c27b0', '#3f51b5', '#00bcd4', '#4caf50', '#ff9800', '#8bc34a', '#009688', '#03a9f4', '#cddc39'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  static formattedReactions(reactions: IReactions): IFormattedReactions[] {
    const postReactions: IFormattedReactions[] = [];
    for (const [key, value] of Object.entries(reactions)) {
      const val: number = value as number;
      if (val > 0) {
        const reactionObject: IFormattedReactions = {
          type: key,
          value: val
        };
        postReactions.push(reactionObject);
      }
    }
    return postReactions;
  }

  static parseJson(str: string): any {
    try {
      JSON.parse(str);
    } catch (e) {
      return str;
    }
    return JSON.parse(str);
  }

  static async getUserPosts(query: any, skip = 0, limit = 0, sort?: any): Promise<IPostDocument[]> {
    return new Promise((resolve) => {
      const posts: Aggregate<IPostDocument[]> = PostModel.aggregate([
        { $match: query },
        { $sort: sort },
        { $skip: skip },
        { $limit: limit },
        { $addFields: { objectReactions: { $objectToArray: '$reactions' } } },
        {
          $addFields: {
            reactions: {
              $map: {
                input: '$objectReactions',
                as: 'reaction',
                in: { type: '$$reaction.k', value: '$$reaction.v' }
              }
            }
          }
        },
        {
          $addFields: {
            reactions: {
              $filter: {
                input: '$reactions',
                as: 'item',
                cond: { $ne: ['$$item.value', 0] }
              }
            }
          }
        },
        { $project: { objectReactions: 0 } }
      ]);
      resolve(posts);
    });
  }

  static async getPostComments(query: any, skip = 0, limit = 0, sort?: any): Promise<ICommentDocument[]> {
    return new Promise((resolve) => {
      const comments: Aggregate<ICommentDocument[]> = CommentsModel.aggregate([{ $match: query }, { $sort: sort }, { $skip: skip }, { $limit: limit }]);
      resolve(comments);
    });
  }

  static async getPostReactions(query: any, skip: number, limit: number, sort: any): Promise<[IReactionDocument[], number]> {
    const reactions: Aggregate<IReactionDocument[]> = ReactionsModel.aggregate([{ $match: query }, { $sort: sort }, { $skip: skip }, { $limit: limit }]);
    const count: Query<number, IReactionDocument> = ReactionsModel.find(query).countDocuments();
    const response: [IReactionDocument[], number] = await Promise.all([reactions, count]);
    return response;
  }

  static async getMessages(query: any, sort?: any): Promise<IChatMessage[]> {
    const messages: IChatMessage[] = await MessageModel.aggregate([
      { $match: query },
      { $lookup: { from: 'User', localField: 'receiverId', foreignField: '_id', as: 'receiverId' } },
      { $unwind: '$receiverId' },
      { $lookup: { from: 'User', localField: 'senderId', foreignField: '_id', as: 'senderId' } },
      { $unwind: '$senderId' },
      {
        $project: {
          _id: 0,
          'receiverId._id': 1,
          'receiverId.username': 1,
          'receiverId.avatarColor': 1,
          'receiverId.email': 1,
          'receiverId.profilePicture': 1,
          'senderId._id': 1,
          'senderId.username': 1,
          'senderId.profilePicture': 1,
          'senderId.avatarColor': 1,
          'senderId.email': 1,
          createdAt: 1,
          body: 1,
          conversationId: 1,
          images: 1,
          isRead: 1,
          senderName: 1,
          gifUrl: 1
        }
      },
      { $sort: sort }
    ]);
    return messages;
  }

  static escapeRegex(text: string): string {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  }
}
