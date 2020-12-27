import mongoose from 'mongoose';
import { IMessageDocument } from '@chat/interface/chat.interface';

const messageSchema: mongoose.Schema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', index: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  senderName: { type: String },
  receiverName: { type: String },
  body: { type: String, default: '' },
  gifUrl: { type: String, default: '' },
  isRead: { type: Boolean, default: false },
  images: [{ type: String, default: '' }],
  createdAt: { type: Date, default: Date.now }
});

const MessageModel: mongoose.Model<IMessageDocument> = mongoose.model<IMessageDocument>('Message', messageSchema, 'Message');

export { MessageModel };
