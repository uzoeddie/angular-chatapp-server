import express, { Router } from 'express';
import { authMiddleware } from '@global/auth-middlewares';
import { Delete } from '@notifications/controllers/delete-notification';
import { Get } from '@notifications/controllers/get-notifications';
import { Update } from '@notifications/controllers/update-notification';

class NotificationRoutes {
    private router: Router;

    constructor() {
        this.router = express.Router();
    }

    public routes(): Router {
        this.router.get('/notifications', authMiddleware.checkAuthentication, Get.prototype.notification);
        this.router.put('/notifications/:notificationId', authMiddleware.checkAuthentication, Update.prototype.notification);
        this.router.delete('/notifications/:notificationId', authMiddleware.checkAuthentication, Delete.prototype.notification);

        return this.router;
    }
}

export const notificationRoutes: NotificationRoutes = new NotificationRoutes();