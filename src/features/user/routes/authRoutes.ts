import express, { Router, Request, Response } from 'express';
import { authMiddleware } from '@global/auth-middlewares';
import { CurrentUser } from '@user/controllers/auth/current-user';
import { Password } from '@user/controllers/auth/password';
import { SignIn } from '@user/controllers/auth/signin';
import { SignOut } from '@user/controllers/auth/signout';
import { SignUp } from '@user/controllers/auth/signup';
import { performance } from 'perf_hooks';
import axios from 'axios';

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

class HealthRoute {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/health', async (req: Request, res: Response) => {
      res.status(200).send(`Server instance is healthy with process id ${process.pid}`);
    });

    return this.router;
  }

  public fiboRoutes(): Router {
    this.router.get('/fibo/:num', async (req: Request, res: Response) => {
      const start: number = performance.now();
      const result: number = this.fibo(parseInt(req.params.num));
      const end: number = performance.now();
      const response = await axios({
        method: 'get',
        url: 'http://169.254.169.254/latest/meta-data/instance-id'
      });
      res.status(200).send(`Fibonacci series of ${req.params.num} is ${result} and it took ${end - start} ms with EC2 instance id ${response.data} and process id ${process.pid}.`);
    });

    return this.router;
  }

  private fibo(n: number): number {
    if (n < 2) {
      return 1;
    } else {
      const res: number = this.fibo(n - 2) + this.fibo(n - 1);
      return res;
    }
  }
}

export const authRoutes: AuthRoutes = new AuthRoutes();
export const currentUserRoute: CurrentUserRoute = new CurrentUserRoute();
export const healthRoute: HealthRoute = new HealthRoute();
