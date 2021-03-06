import { Server, Socket } from 'socket.io';
import { ICommentDocument, IReactionDocument } from '@comments/interface/comment.interface';

let socketIOPostObject: Server;
export class SocketIOPostHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    socketIOPostObject = io;
  }

  public listen(): void {
    this.io.on('connection', (socket: Socket) => {
      socket.on('reaction', (data: IReactionDocument) => {
        this.io.emit('update like', data);
      });

      socket.on('comment', (data: ICommentDocument) => {
        this.io.emit('update comment', data);
      });
    });
  }
}

export { socketIOPostObject };
