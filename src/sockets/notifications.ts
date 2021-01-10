import { Server } from 'socket.io';

let socketIONotificationObject: Server;
export class SocketIONotificationsHandler {
  public listen(io: Server): void {
    socketIONotificationObject = io;
  }
}

export { socketIONotificationObject };
