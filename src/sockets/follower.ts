import { IFollowers } from '@followers/interface/followers.interface';
import { Server, Socket } from 'socket.io';

export class SocketIOFollowerHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  public listen(): void {
    this.io.of('/').on('connection', (socket: Socket) => {
      socket.on('follow user', (data: IFollowers) => {
        this.io.emit('add follower', data);
      });

      socket.on('unfollow user', (data: IFollowers) => {
        this.io.emit('remove follower', data);
      });
    });
  }
}
