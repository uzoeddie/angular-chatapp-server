import express, { Router, Request, Response } from 'express';
import { authMiddleware } from '@global/auth-middlewares';
import { CurrentUser } from '@user/controllers/auth/current-user';
import { Password } from '@user/controllers/auth/password';
import { SignIn } from '@user/controllers/auth/signin';
import { SignOut } from '@user/controllers/auth/signout';
import { SignUp } from '@user/controllers/auth/signup';
import { performance } from 'perf_hooks';
import axios from 'axios';
import moment from 'moment';
import publicIP from 'public-ip';

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
    this.router.get('/health', (req: Request, res: Response) => {
      res.status(200).send(`Dev server instance is healthy with process id ${process.pid}`);
    });

    return this.router;
  }

  public appRoutes(): Router {
    this.router.get('/', async (req: Request, res: Response) => {
      const ip = await publicIP.v4();
      res.status(200).send(`This is the dev server and todays date is ${moment(new Date()).format('DD/MM/YYYY HH:mm')} from IP ${ip}`);
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

  public instance(): Router {
    this.router.get('/instance', async (req: Request, res: Response) => {
      const response = await axios({
        method: 'get',
        url: 'http://169.254.169.254/latest/meta-data/instance-id'
      });
      res.status(200).send(`Development server is running on EC2 instance with id ${response.data} and process id ${process.pid}.`);
    });

    return this.router;
  }

  // optimized fibo using memoization
  // public fib(n: number, memo = {}) {
  //   if (n in memo) return memo[n];
  //   if (n <= 2) return 1;
  //   memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
  //   return memo[n];
  // }

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
