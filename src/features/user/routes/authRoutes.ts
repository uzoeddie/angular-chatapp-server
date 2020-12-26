import express, { Router } from 'express';
import { authMiddleware } from '@global/auth-middlewares';
import { CurrentUser } from '@user/controllers/auth/current-user';
import { Password } from '@user/controllers/auth/password';
import { SignIn } from '@user/controllers/auth/signin';
import { SignOut } from '@user/controllers/auth/signout';
import { SignUp } from '@user/controllers/auth/signup';

class AuthRoutes {
    private router: Router;

    constructor() {
        this.router = express.Router();
    }

    public routes(): Router {
        this.router.post('/signup', SignUp.prototype.create);
        this.router.post('/signin', SignIn.prototype.read);
        this.router.post('/forgot-password', Password.prototype.create);
        this.router.post('/reset-password/:token', Password.prototype.update);

        return this.router;
    }

    public SignOutRoute(): Router {
        this.router.get('/signout', SignOut.prototype.update);

        return this.router;
    }
}

class CurrentUserRoute {
    private router: Router;

    constructor() {
        this.router = express.Router();
    }

    public routes(): Router {
        this.router.get('/currentuser', authMiddleware.checkAuthentication, CurrentUser.prototype.read);

        return this.router;
    }
}

export const authRoutes: AuthRoutes = new AuthRoutes();
export const currentUserRoute: CurrentUserRoute = new CurrentUserRoute();
