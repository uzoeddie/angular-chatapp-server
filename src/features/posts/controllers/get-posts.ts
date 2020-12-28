import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { Helpers } from '@global/helpers';
import { IPostDocument } from '@posts/interface/post.interface';
import { getPostsFromCache, getSinglePostFromCache } from '@redis/post-cache';

const PAGE_SIZE = 5;

export class Get {
  public async posts(req: Request, res: Response): Promise<void> {
    const { page } = req.params;
    const skip: number = (parseInt(page) - 1) * PAGE_SIZE;
    const limit: number = PAGE_SIZE * parseInt(page);
    let posts: IPostDocument[] = [];
    const newSkip: number = skip === 0 ? skip : skip + 1;
    const cachedData: IPostDocument[] = await getPostsFromCache('post', newSkip, limit);
    posts = cachedData.length ? cachedData : await Helpers.getUserPosts({}, skip, PAGE_SIZE, { createdAt: -1 });
    res.status(HTTP_STATUS.OK).json({ message: 'All posts', posts, type: 'posts' });
  }

  public async postById(req: Request, res: Response): Promise<void> {
    const cachedData: IPostDocument[] = await getSinglePostFromCache(req.params.postId);
    const post: IPostDocument[] = cachedData.length ? cachedData : await Helpers.getUserPosts({ _id: req.params.postId }, 0, 1, { createdAt: -1 });
    res.status(HTTP_STATUS.OK).json({ message: 'Single post', post: post[0] });
  }
}
