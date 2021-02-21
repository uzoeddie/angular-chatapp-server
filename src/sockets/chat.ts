import { ISenderReceiver, ITyping } from '@chat/interface/chat.interface';
import { connectedUsersMap } from '@sockets/users';
import { Server, Socket } from 'socket.io';

let socketIOChatObject: Server;
export class SocketIOChatHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    socketIOChatObject = io;
  }

  public listen(): void {
    this.io.on('connection', (socket: Socket) => {
      this.socketIOChat(socket);
      this.chatPageSocket(socket);
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

    socket.on('new message with image', (data: any) => {
      const senderSocketId: string = connectedUsersMap.get(data.senderId?._id) as string;
      const receiverSocketId: string = connectedUsersMap.get(data.receiverId?._id) as string;
      this.io.to(senderSocketId).to(receiverSocketId).emit('message received', data);
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
}

export { socketIOChatObject };
