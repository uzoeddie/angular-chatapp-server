import { IChatMessage, ITyping } from '@chat/interface/chat.interface';
import { MessageModel } from '@chat/models/chat.schema';
import { connectedUsersMap } from '@sockets/users';
import { ChangeStream } from 'mongodb';
import { Server, Socket } from 'socket.io';

interface ISenderReceiver {
  sender: string;
  receiver: string;
  senderName: string;
  receiverName: string;
}

export class SocketIOChatHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  public listen(): void {
    this.io.on('connection', (socket: Socket) => {
      this.socketIOChat(socket);
      this.chatPageSocket(socket);
      this.messageModelChangeStream(socket);
    });
  }

  private socketIOChat(socket: Socket): void {
    socket.on('join room', (usersId: ISenderReceiver) => {
      const { sender, receiver } = usersId;
      const senderSocketId: string = connectedUsersMap.get(sender) as string;
      const receiverSocketId: string = connectedUsersMap.get(receiver) as string;
      socket.join(senderSocketId);
      socket.join(receiverSocketId);
    });

    socket.on('new message', (usersId: ISenderReceiver, message: IChatMessage) => {
      const { sender, receiver } = usersId;
      const senderSocketId: string = connectedUsersMap.get(sender) as string;
      const receiverSocketId: string = connectedUsersMap.get(receiver) as string;
      this.io.to(senderSocketId).to(receiverSocketId).emit('message received', message);
      this.io.to(senderSocketId).to(receiverSocketId).emit('chat list', message);
      this.io.emit('trigger message notification', message);
    });

    socket.on('start_typing', (data: ITyping) => {
      const receiverSocketId: string = connectedUsersMap.get(data.receiver) as string;
      this.io.to(receiverSocketId).emit('is_typing', data);
    });

    socket.on('stop_typing', (data: ITyping) => {
      const receiverSocketId: string = connectedUsersMap.get(data.receiver) as string;
      this.io.to(receiverSocketId).emit('has_stopped_typing', data);
    });
  }

  private chatPageSocket(socket: Socket): void {
    socket.on('join page', (usersId: ISenderReceiver) => {
      const { senderName, receiverName } = usersId;
      this.io.emit('chat page', {
        name: senderName.toLowerCase(),
        url: `/app/social/chat/messages/${receiverName.toLowerCase()}`,
        type: 'join'
      });
    });

    socket.on('leave chat page', (username: string) => {
      this.io.emit('chat page', {
        name: username,
        type: 'leave'
      });
    });
  }

  private messageModelChangeStream(socket: Socket): void {
    const changeStream: ChangeStream = MessageModel.watch([], { fullDocument: 'updateLookup' });
    socket.on('message change stream', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      changeStream.once('change', (change: any) => {
        if (!change.documentKey) {
          return;
        }
        if (change.operationType === 'update') {
          this.io.emit('message collection update', change.fullDocument);
        }
      });
    });
  }
}
