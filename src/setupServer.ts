import express, { Response, Request, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import hpp from 'hpp';
import 'express-async-errors';
import cookieParser from 'cookie-parser';
import HTTP_STATUS from 'http-status-codes';
import { UI } from 'bull-board';
import Logger from 'bunyan';
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
import redisAdapter from 'socket.io-redis';
import socketIO from 'socket.io';

const responseTime = require('response-time');

const log: Logger = config.createLogger('main');

export class ChatServer {
    private app: express.Application;

    constructor(app: express.Application) {
        this.app = app;
    }

    public start(): void {
        this.securityMiddleWares(this.app);
        this.standardMiddlewares(this.app);
        this.devMiddlewares(this.app);
        this.routeMiddleWares(this.app);
        this.globalErrorHandler(this.app);
        this.startServer(this.app);
    }

    private securityMiddleWares(app: express.Application): void {
        app.set('trust proxy', true);
        app.use(hpp());
        app.use(helmet());
        app.use(cors());
    }

    private standardMiddlewares(app: express.Application): void {
        app.use(compression());
        app.use(cookieParser());
        app.use(express.json({ limit: '50mb' }));
        app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    }

    private devMiddlewares(app: express.Application): void {
        if (process.env.NODE_ENV !== 'production') {
            app.use(responseTime());
            app.use('/api/v1/admin/queues', UI);
        }
    }

    private routeMiddleWares(app: express.Application): void {
        app.use('/api/v1/chatapp', authRoutes.routes());
        app.use('/api/v1/chatapp', authRoutes.SignOutRoute());
        
        app.use('/api/v1/chatapp', authMiddleware.verifyUser, currentUserRoute.routes());
        app.use('/api/v1/chatapp', authMiddleware.verifyUser, userRoutes.routes());
        app.use('/api/v1/chatapp', authMiddleware.verifyUser, postRoutes.routes());
        app.use('/api/v1/chatapp', authMiddleware.verifyUser, commentRoutes.routes());
        app.use('/api/v1/chatapp', authMiddleware.verifyUser, imagesRoutes.routes());
        app.use('/api/v1/chatapp', authMiddleware.verifyUser, followersRoutes.routes());
        app.use('/api/v1/chatapp', authMiddleware.verifyUser, notificationRoutes.routes());
        app.use('/api/v1/chatapp', authMiddleware.verifyUser, chatRoutes.routes());
    }

    private globalErrorHandler(app: express.Application): void {
        app.all('*', async (req: Request, res: Response) => {
            res.status(HTTP_STATUS.NOT_FOUND).json({ message: `${req.originalUrl} not found...`});
        });
    
        app.use((err: IErrorResponse, _req: Request, res: Response, _next: NextFunction) => {
            log.error(err);
            if (err instanceof CustomError) {
                return res.status(err.statusCode).json({ errors: err.serializeErrors(), message: err.serializeErrors().message });
            }
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                message: 'Error occurred on the server',
                errors: { message: 'Error occurred on the server', statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR, err }
            });
        });
    }

    private startServer(app: express.Application): void {
        if (!config.JWT_TOKEN) {
            throw new Error('JWT_TOKEN must be provided');
        }
    
        try {   
            const httpServer: http.Server = new http.Server(app); 
            const socketIO = this.createSocketIO(httpServer);
            this.socketIOConnections(socketIO);
            this.startHttpServer(httpServer);
        } catch (error) {
            return error;
        }
    }

    private createSocketIO(httpServer: http.Server): SocketIO.Server {
        const io: SocketIO.Server = socketIO(httpServer);
        const PORT = parseInt(config.REDIS_PORT!, 10) || 6379;
        io.adapter(redisAdapter({
            host: config.REDIS_HOST! || 'localhost',
            port: PORT,
        }));
        return io;
    } 

    private startHttpServer(httpServer: http.Server): void {
        const PORT: string = config.PORT!;
        httpServer.listen(PORT, () => {
            log.info(`Successfully started running server on port ${PORT}`);
        });
    }

    private socketIOConnections(io: SocketIO.Server): void {
        const userSocketIOHandler: SocketIOUserHandler = new SocketIOUserHandler(io);
        const postsSocketIOHandler: SocketIOPostHandler = new SocketIOPostHandler(io);
        const chatSocketIOHandler: SocketIOChatHandler = new SocketIOChatHandler(io);
        const imageChangeStreamHandler: SocketIOImageHandler = new SocketIOImageHandler(io);
        const notificationChangeStreamHandler: SocketIONotificationsHandler = new SocketIONotificationsHandler(io);
        const followersSocketIOHandler: SocketIOFollowerHandler = new SocketIOFollowerHandler(io);
        postsSocketIOHandler.listen();
        userSocketIOHandler.listen();
        chatSocketIOHandler.listen();
        imageChangeStreamHandler.imageModelChangeStream();
        notificationChangeStreamHandler.notificationModelChangeStream();
        followersSocketIOHandler.listen();
    }
}