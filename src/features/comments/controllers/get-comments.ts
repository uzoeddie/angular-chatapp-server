import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import mongoose from 'mongoose';
import { Helpers } from '@global/helpers';
import { getCommentsFromRedisCache } from '@redis/comments-cache';
import { ICommentDocument, IReactionDocument, IRedisCommentList } from '@comments/interface/comment.interface';

// const PAGE_SIZE = 1;
export class GetPost {
  public async comments(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    // console.log(page);
    // let skip: number = (parseInt(page) - 1) * PAGE_SIZE;
    // let limit: number = PAGE_SIZE * parseInt(page);
    const comments: ICommentDocument[] = await Helpers.getPostComments({ postId: mongoose.Types.ObjectId(postId) }, 0, 100, {
      createdAt: -1
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Post comments', comments });
  }

  public async commentsFromCache(req: Request, res: Response): Promise<void> {
    const comments: IRedisCommentList = await getCommentsFromRedisCache(req.params.postId);
    res.status(HTTP_STATUS.OK).json({ message: 'Post comments names', comments });
  }

  public async reactions(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    // let skip: number = 0;
    // let limit: number = 20;
    // if (page !== 'undefined') {
    //     skip = (parseInt(page) - 1) * 1;
    //     limit = PAGE_SIZE * parseInt(page);
    // }
    const reactions: [IReactionDocument[], number] = await Helpers.getPostReactions({ postId: mongoose.Types.ObjectId(postId) }, 0, 100, { createdAt: -1 });
    res.status(HTTP_STATUS.OK).json({ message: 'Post reactions', reactions: reactions[0], count: reactions[1] });
  }

  public async singleComment(req: Request, res: Response): Promise<void> {
    const { commentId } = req.params;
    const comments: ICommentDocument[] = await Helpers.getPostComments({ _id: mongoose.Types.ObjectId(commentId) }, 0, 1, {
      createdAt: -1
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Single comment', comment: comments[0] });
  }

  public async singleReaction(req: Request, res: Response): Promise<void> {
    const { reactionId } = req.params;
    const reactions: [IReactionDocument[], number] = await Helpers.getPostReactions({ _id: mongoose.Types.ObjectId(reactionId) }, 0, 1, { createdAt: -1 });
    res.status(HTTP_STATUS.OK).json({ message: 'Single post reaction', reactions: reactions[0], count: reactions[1] });
  }
}
