import { NotificationModel } from '@notifications/models/notification.schema';
import { ChangeStream } from 'mongodb';
import { Server } from 'socket.io';

export class SocketIONotificationsHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  public notificationModelChangeStream(): void {
    const changeStream: ChangeStream = NotificationModel.watch();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    changeStream.on('change', async (change: any) => {
      if (!change.documentKey) {
        return;
      }
      const { fullDocument, operationType, documentKey } = change;
      if (operationType === 'insert') {
        const notifications = await NotificationModel.find({ userTo: fullDocument.userTo }).lean().populate({ path: 'userFrom', select: 'username avatarColor uId profilePicture' }).sort({ date: -1 });
        this.io.emit('insert notification', notifications, fullDocument);
      }

      if (operationType === 'update') {
        this.io.emit('update notification', documentKey._id);
      }

      if (operationType === 'delete') {
        this.io.emit('delete notification', documentKey._id);
      }
    });
  }
}
