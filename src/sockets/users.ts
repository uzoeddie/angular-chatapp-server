import { UserModel } from '@user/models/user.schema';
import { ChangeStream } from 'mongodb';
import { Server, Socket } from 'socket.io';

export const connectedUsersMap: Map<any, any> = new Map();

interface ISocketData {
  blockedUser: string;
  blockedBy: string;
}

interface ILogin {
  userId: string;
}

export class SocketIOUserHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    this.userModelChangeStream();
  }

  public listen(): void {
    this.io.on('connection', (socket: Socket) => {
      socket.on('setup', (data: ILogin) => {
        this.addClientToMap(data.userId, socket.id);
      });
  
      socket.on('block user', (data: ISocketData) => {
        this.io.emit('blocked user id', data);
      });
  
      socket.on('unblock user', (data: ISocketData) => {
        this.io.emit('unblocked user id', data);
      });
  
      socket.on('disconnect', () => {
        this.removeClientFromMap(socket.id);
      });
    });
  }

  private userModelChangeStream() {
    const changeStream: ChangeStream<any> = UserModel.watch([], { fullDocument: 'updateLookup' });
    changeStream.on('change', async (change: any) => {
      if (!change.documentKey) { return; }      
      if (change.operationType === 'update') {
        this.io.emit('update user', change.fullDocument);
      }
    });
  }

  public addClientToMap(userId: string, socketId: string): void {
    if (!connectedUsersMap.has(userId)) {
      connectedUsersMap.set(userId, socketId);
    }
    this.io.emit('user online', [...connectedUsersMap.keys()]);
  }

  private removeClientFromMap(socketId: string): void {
    if (Array.from(connectedUsersMap.values()).includes(socketId)) {
      const disconnectedUser: [string, string] = [...connectedUsersMap].find(([key, val]) => val === socketId) as [string, string];
      connectedUsersMap.delete(disconnectedUser[0]);
      this.io.emit('user online', [...connectedUsersMap.keys()]);
    }
  }
}

