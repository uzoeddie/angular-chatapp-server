import mongoose from 'mongoose';
import { Helpers } from '@global/helpers';
import { IPostDocument } from '@posts/interface/post.interface';
import { PostModel } from '@posts/models/post.schema';
import { Server, Socket } from 'socket.io';
import { ICommentDocument, IReactionDocument } from '@comments/interface/comment.interface';
import { ChangeStream } from 'mongodb';

const unflatten = require('flat').unflatten;
export class SocketIOPostHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    this.postModelChangeStream();
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

  private postModelChangeStream() {
    const changeStream: ChangeStream<any> = PostModel.watch();
    let type;
    changeStream.on('change', async (change: any) => {
      if (!change.documentKey) { return; }
      const { operationType, documentKey, fullDocument, updateDescription } = change;
      if (operationType === 'insert') {
        fullDocument.reactions = [];
        this.io.emit('post message', fullDocument);
      }
      
      if (operationType === 'update') {
        const { updatedFields } = updateDescription;
        const updatedReactions = unflatten(updatedFields);
        if (updatedFields.comments || updatedReactions.reactions) {
          type = 'comments';
        } else {
          type = 'posts';
        }
        const query = { _id: mongoose.Types.ObjectId(documentKey._id) }
        const post: IPostDocument[] = await Helpers.getUserPosts(query, 0, 1, { createdAt: -1 });
        this.io.emit('update post', post[0], type);
      }
  
      if (operationType === 'delete') {
        this.io.emit('delete message', documentKey._id);
      }
    });
  }
}
