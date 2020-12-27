import { ImageModel } from '@images/models/images.schema';
import { ChangeStream } from 'mongodb';
import { Server } from 'socket.io';

export class SocketIOImageHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  public imageModelChangeStream(): void {
    const changeStream: ChangeStream = ImageModel.watch([], { fullDocument: 'updateLookup' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    changeStream.on('change', async (change: any) => {
      if (!change.documentKey) {
        return;
      }
      if (change.operationType !== 'delete') {
        this.io.emit('insert image', change.fullDocument);
      }

      if (change.operationType === 'delete') {
        this.io.emit('delete image', change.documentKey._id);
      }
    });
  }
}
