import express, { Router } from 'express';
import { authMiddleware } from '@global/auth-middlewares';
import { AddMessage } from '@images/controllers/add-chat-image';
import { Add } from '@images/controllers/add-image';
import { Delete } from '@images/controllers/delete-image';
import { Get } from '@images/controllers/get-images';

class ImagesRoutes {
    private router: Router;

    constructor() {
        this.router = express.Router();
    }

    public routes(): Router {
        this.router.get('/images/:userId', authMiddleware.checkAuthentication, Get.prototype.images);
        this.router.post('/images', authMiddleware.checkAuthentication, Add.prototype.image);
        this.router.post('/images/background', authMiddleware.checkAuthentication, Add.prototype.backgroundImage);
        this.router.post('/images/chat-message', authMiddleware.checkAuthentication, AddMessage.prototype.image);
        this.router.put('/images/:imageId', authMiddleware.checkAuthentication, Delete.prototype.image);

        return this.router;
    }
}

export const imagesRoutes: ImagesRoutes = new ImagesRoutes();