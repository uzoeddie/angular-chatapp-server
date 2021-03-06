import { Response, Request, json, urlencoded, Application, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import hpp from 'hpp';
import 'express-async-errors';
import cookieSession from 'cookie-session';
import HTTP_STATUS from 'http-status-codes';
import Logger from 'bunyan';
import { createAdapter } from 'socket.io-redis';
import { RedisClient } from 'redis';
import { Server } from 'socket.io';
import responseTime from 'response-time';
import { router } from 'bull-board';
// import swaggerUI from 'swagger-ui-express';
// import yaml from 'js-yaml';
// import fs from 'fs';
import { authRoutes, currentUserRoute } from '@user/routes/authRoutes';
import { authMiddleware } from '@global/auth-middlewares';
import { chatRoutes } from '@chat/routes/chatRoutes';
import { commentRoutes } from '@comments/routes/commentRoutes';
import { followersRoutes } from '@followers/routes/followersRoutes';
import { IErrorResponse, CustomError } from '@global/error-handler';
import { imagesRoutes } from '@images/routes/imagesRoutes';
import { notificationRoutes } from '@notifications/routes/notificationRoutes';
import { postRoutes } from '@posts/routes/postRoutes';
import { SocketIOChatHandler } from '@sockets/chat';
import { SocketIOFollowerHandler } from '@sockets/follower';
import { SocketIOImageHandler } from '@sockets/images';
import { SocketIONotificationsHandler } from '@sockets/notifications';
import { SocketIOPostHandler } from '@sockets/posts';
import { SocketIOUserHandler } from '@sockets/users';
import { userRoutes } from '@user/routes/userRoutes';
import { config } from '@root/config';
import { healthRoute } from '@user/routes/healthRoutes';
// import swaggerDocument from '@root/swagger.yaml';
import swaggerStats from 'swagger-stats';

const log: Logger = config.createLogger('main');
const REDIS_PORT = 6379;
const SERVER_PORT = 5000;
const BASE_PATH = '/api/v1/chatapp';
export class ChatServer {
  private app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  public start(): void {
    this.securityMiddleWares(this.app);
    this.standardMiddlewares(this.app);
    this.routeMiddleWares(this.app);
    this.apiDocumentSetup(this.app);
    this.globalErrorHandler(this.app);
    this.startServer(this.app);
  }

  private securityMiddleWares(app: Application): void {
    app.set('trust proxy', 1);
    app.use(
      cookieSession({
        name: 'session',
        keys: [process.env.SECRET_KEY_ONE!, process.env.SECRET_KEY_TWO!],
        maxAge: 1 * 60 * 60 * 1000
        // secure: process.env.NODE_ENV !== 'development',
        // sameSite: 'none'
      })
    );
    app.use(hpp());
    app.use(helmet());
    app.use(helmet.hidePoweredBy());
    app.use(
      cors({
        origin: config.CLIENT_URL,
        credentials: true
      })
    );
  }

  private standardMiddlewares(app: Application): void {
    app.use(compression());
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));
    app.use(responseTime());
    app.use('/queues', router);
  }

  private async apiDocumentSetup(app: Application): Promise<void> {
    try {
      // const swaggerDocument: string = await JSON.stringify(yaml.load(fs.readFileSync('../swagger.yaml', 'utf8')));
      // app.use('/docs', swaggerUI.serve, swaggerUI.setup(JSON.parse(swaggerDocument), { explorer: true }));
      app.use(
        swaggerStats.getMiddleware({
          uriPath: '/swagger-stats'
        })
      );
    } catch (error) {
      log.error(error);
    }
  }

  private routeMiddleWares(app: Application): void {
    app.use('', healthRoute.routes());
    app.use('', healthRoute.fiboRoutes());
    app.use('', healthRoute.appRoutes());
    app.use('', healthRoute.instance());
    app.use(BASE_PATH, authRoutes.routes());
    app.use(BASE_PATH, authRoutes.SignOutRoute());

    app.use(BASE_PATH, authMiddleware.verifyUser, currentUserRoute.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, userRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, postRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, commentRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, imagesRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, followersRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, notificationRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, chatRoutes.routes());
  }

  private globalErrorHandler(app: Application): void {
    app.all('*', async (req: Request, res: Response) => {
      res.status(HTTP_STATUS.NOT_FOUND).json({ message: `${req.originalUrl} not found...` });
    });

    app.use((err: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
      if (err instanceof CustomError) {
        return res.status(err.statusCode).json(err.serializeErrors());
      }
      next(err);
    });
  }

  private startServer(app: Application): void {
    if (!config.JWT_TOKEN) {
      throw new Error('JWT_TOKEN must be provided');
    }

    try {
      const httpServer: http.Server = new http.Server(app);
      const socketIO: Server = this.createSocketIO(httpServer);
      this.startHttpServer(httpServer);
      this.socketIOConnections(socketIO);
    } catch (error) {
      log.error(error);
    }
  }

  private createSocketIO(httpServer: http.Server): Server {
    const io: Server = new Server(httpServer, {
      cors: {
        origin: config.CLIENT_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      }
    });
    const pubClient: RedisClient = new RedisClient({ host: config.REDIS_HOST! || 'localhost', port: REDIS_PORT });
    const subClient: RedisClient = pubClient.duplicate();
    io.adapter(createAdapter({ pubClient, subClient }));
    return io;
  }

  private startHttpServer(httpServer: http.Server): void {
    log.info(`Worker with a process id of ${process.pid} has started...`);
    log.info(`Server has started for process ${process.pid}`);
    httpServer.listen(SERVER_PORT, () => {
      log.info(`Successfully started running server on port ${SERVER_PORT}`);
    });
  }

  private socketIOConnections(io: Server): void {
    const userSocketIOHandler: SocketIOUserHandler = new SocketIOUserHandler(io);
    const postsSocketIOHandler: SocketIOPostHandler = new SocketIOPostHandler(io);
    const chatSocketIOHandler: SocketIOChatHandler = new SocketIOChatHandler(io);
    const imageHandler: SocketIOImageHandler = new SocketIOImageHandler();
    const notificationHandler: SocketIONotificationsHandler = new SocketIONotificationsHandler();
    const followersSocketIOHandler: SocketIOFollowerHandler = new SocketIOFollowerHandler();
    postsSocketIOHandler.listen();
    userSocketIOHandler.listen();
    chatSocketIOHandler.listen();
    imageHandler.listen(io);
    notificationHandler.listen(io);
    followersSocketIOHandler.listen(io);
  }
}
