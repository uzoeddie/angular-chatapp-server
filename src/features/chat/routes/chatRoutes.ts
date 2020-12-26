import express, { Router } from 'express';
import { AddChat } from '@chat/controllers/add-chat-message';
import { GetChat } from '@chat/controllers/get-chat-message';
import { MarkChat } from '@chat/controllers/mark-chat-message';
import { Search } from '@chat/controllers/search-chat-user';
import { authMiddleware } from '@global/auth-middlewares';

class ChatRoutes {
    private router: Router;

    constructor() {
        this.router = express.Router();
    }

    public routes(): Router {
        this.router.get('/user/profile/search/:query', authMiddleware.checkAuthentication, Search.prototype.users);
        this.router.get('/chat/messages/list', authMiddleware.checkAuthentication, GetChat.prototype.list);
        this.router.get('/chat/messages/:receiverId/:conversationId', authMiddleware.checkAuthentication, GetChat.prototype.messages);
        this.router.post('/chat/messages', authMiddleware.checkAuthentication, AddChat.prototype.message);
        this.router.put('/chat/messages/mark-as-read', authMiddleware.checkAuthentication, MarkChat.prototype.message);

        return this.router;
    }
}

export const chatRoutes: ChatRoutes = new ChatRoutes();