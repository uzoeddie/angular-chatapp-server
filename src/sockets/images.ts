import { ImageModel } from "@images/models/images.schema";
import { ChangeStream } from "mongodb";
import { Server } from 'socket.io';

export class SocketIOImageHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  public imageModelChangeStream() {
    const changeStream: ChangeStream<any> = ImageModel.watch([], { fullDocument: 'updateLookup' });
    changeStream.on('change', async (change: any) => {
      if (!change.documentKey) { return; }
      if (change.operationType !== 'delete') {  
        this.io.emit('insert image', change.fullDocument);
      }
  
      if (change.operationType === 'delete') {
        this.io.emit('delete image', change.documentKey._id);
      }
    });
  }
}
