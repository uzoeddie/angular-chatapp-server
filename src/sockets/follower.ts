import { Server, Socket } from 'socket.io';

export class SocketIOFollowerHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  public listen(): void {
    this.io.on('connection', (socket: Socket) => {
      // TODO: I am too lazy to add the interface
      socket.on('follow user', (data: any) => {
        this.io.emit('add follower', data);
      });
  
      socket.on('unfollow user', (data: any) => {
        this.io.emit('remove follower', data);
      });
    });
  }
}
