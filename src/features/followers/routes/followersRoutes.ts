import express, { Router } from 'express';
import { Block } from '@followers/controllers/block-user';
import { Add } from '@followers/controllers/follow-user';
import { Get } from '@followers/controllers/get-followers';
import { Remove } from '@followers/controllers/unfollow-user';
import { authMiddleware } from '@global/auth-middlewares';

class FollowersRoutes {
    private router: Router;

    constructor() {
        this.router = express.Router();
    }

    public routes(): Router {
        this.router.get('/user/get-followers', authMiddleware.checkAuthentication, Get.prototype.followers);
        this.router.get('/user/followers/:userId', authMiddleware.checkAuthentication, Get.prototype.userFollowers);
        this.router.get('/user/following', authMiddleware.checkAuthentication, Get.prototype.following);
        this.router.put('/user/follow/:followerId', authMiddleware.checkAuthentication, Add.prototype.follower);
        this.router.put('/user/unfollow/:followerId', authMiddleware.checkAuthentication, Remove.prototype.following);
        this.router.put('/user/block/:followerId', authMiddleware.checkAuthentication, Block.prototype.follower);
        this.router.put('/user/unblock/:followerId', authMiddleware.checkAuthentication, Block.prototype.unblockFollower);

        return this.router;
    }
}

export const followersRoutes: FollowersRoutes = new FollowersRoutes();