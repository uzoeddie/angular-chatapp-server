import { Server, Socket } from 'socket.io';
import { eventEmitter } from '@global/helpers';
import { config } from '@root/config';
import Logger from 'bunyan';
import { ILogin, ISocketData } from '@user/interface/user.interface';

export const connectedUsersMap: Map<string, string> = new Map();
export class SocketIOUserHandler {
  private io: Server;
  log: Logger;

  constructor(io: Server) {
    this.io = io;
    this.log = config.createLogger('app');
  }

  public listen(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    eventEmitter.on('userInfo', (data: any) => {
      this.io.emit('update user', data);
    });

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
        eventEmitter.removeListener('userInfo', () => {
          this.log.info('Event emitter removed');
        });
      });
    });
  }

  private addClientToMap(userId: string, socketId: string): void {
    if (!connectedUsersMap.has(userId)) {
      connectedUsersMap.set(userId, socketId);
    }
    this.io.emit('user online', [...connectedUsersMap.keys()]);
  }

  private removeClientFromMap(socketId: string): void {
    if (Array.from(connectedUsersMap.values()).includes(socketId)) {
      const disconnectedUser: [string, string] = [...connectedUsersMap].find((user: [string, string]) => {
        return user[1] === socketId;
      }) as [string, string];
      connectedUsersMap.delete(disconnectedUser[0]);
      this.io.emit('user online', [...connectedUsersMap.keys()]);
    }
  }
}
