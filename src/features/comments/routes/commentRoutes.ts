import express, { Router } from 'express';
import { AddReaction } from '@comments/controllers/add-reactions';
import { GetPost } from '@comments/controllers/get-comments';
import { authMiddleware } from '@global/auth-middlewares';
import { Add } from '@comments/controllers/add-comment';
import { Remove } from '@comments/controllers/remove-reactions';

class CommentRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/post/comments/:postId/:page', authMiddleware.checkAuthentication, GetPost.prototype.comments);
    this.router.get('/post/comments/:commentId', authMiddleware.checkAuthentication, GetPost.prototype.singleComment);
    this.router.get('/post/reactions/:reactionId', authMiddleware.checkAuthentication, GetPost.prototype.singleReaction);
    this.router.get('/post/reactions/:postId/:page', authMiddleware.checkAuthentication, GetPost.prototype.reactions);
    this.router.get('/post/comment/names/:postId', authMiddleware.checkAuthentication, GetPost.prototype.commentsFromCache);
    this.router.post('/post/comments', authMiddleware.checkAuthentication, Add.prototype.comment);
    this.router.post('/post/reactions', authMiddleware.checkAuthentication, AddReaction.prototype.reaction);
    this.router.delete('/post/reactions/:postId/:previousReaction', authMiddleware.checkAuthentication, Remove.prototype.reaction);

    return this.router;
  }
}

export const commentRoutes: CommentRoutes = new CommentRoutes();
