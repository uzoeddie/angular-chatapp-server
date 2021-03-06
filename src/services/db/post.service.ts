/* eslint-disable @typescript-eslint/no-explicit-any */
import { ICommentDocument, IReactionDocument } from '@comments/interface/comment.interface';
import { CommentsModel } from '@comments/models/comment.schema';
import { ReactionsModel } from '@comments/models/reactions.schema';
import { IFileImageDocument } from '@images/interface/images.interface';
import { ImageModel } from '@images/models/images.schema';
import { IPostDocument } from '@posts/interface/post.interface';
import { PostModel } from '@posts/models/post.schema';
import { userInfoCache } from '@redis/user-info-cache';
import { IUserDocument } from '@user/interface/user.interface';
import { UserModel } from '@user/models/user.schema';
import { Query, UpdateQuery } from 'mongoose';

class Post {
  public async addPostToDB(userId: string, createdPost: IPostDocument): Promise<void> {
    let images: UpdateQuery<IFileImageDocument> | undefined;
    const post: Promise<IPostDocument> = PostModel.create(createdPost);
    const user: UpdateQuery<IUserDocument> = UserModel.findOneAndUpdate(
      { _id: userId },
      { $inc: { postCount: 1 } },
      { upsert: true, new: true }
    );
    if (createdPost.imgId && createdPost.imgVersion) {
      images = ImageModel.updateOne(
        { userId },
        { $push: { images: { imgId: createdPost.imgId, imgVersion: createdPost.imgVersion } } },
        { upsert: true }
      );
    } else {
      images = undefined;
    }
    const response: [IPostDocument, UpdateQuery<IUserDocument>, UpdateQuery<IFileImageDocument> | undefined] = await Promise.all([
      post,
      user,
      images
    ]);
    await userInfoCache.updateSingleUserItemInRedisCache(`${userId}`, 'postCount', response[1].postCount!);
  }

  public async editPost(postId: string, updatedPost: IPostDocument): Promise<void> {
    let images: UpdateQuery<IFileImageDocument> | undefined;
    const post: UpdateQuery<IPostDocument> = PostModel.updateOne({ _id: postId }, { $set: updatedPost });
    if (updatedPost.imgId && updatedPost.imgVersion) {
      images = ImageModel.updateOne(
        { userId: updatedPost.userId },
        {
          $push: { images: { imgId: updatedPost.imgId!, imgVersion: updatedPost.imgVersion! } }
        },
        { upsert: true }
      );
    } else {
      images = undefined;
    }
    await Promise.all([post, images]);
  }

  public async deletePost(postId: string, userId: string): Promise<void> {
    const deletPost: Query<any, IPostDocument> = PostModel.deleteOne({ _id: postId });
    const decrementPostNumber: UpdateQuery<IUserDocument> = UserModel.updateOne({ _id: userId }, { $inc: { postCount: -1 } });
    const deleteComments: Query<any, ICommentDocument> = CommentsModel.deleteMany({ postId: postId });
    const deleteReactions: Query<any, IReactionDocument> = ReactionsModel.deleteMany({ postId: postId });
    await Promise.all([deletPost, decrementPostNumber, deleteComments, deleteReactions]);
  }
}

export const postService: Post = new Post();
