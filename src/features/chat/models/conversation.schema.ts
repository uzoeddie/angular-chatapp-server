import mongoose from 'mongoose';
import { IConversationDocument } from '@chat/interface/converation.interface';

const conversationSchema: mongoose.Schema = new mongoose.Schema({  
    participants: [{
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User'}
    }]
});

const ConversationModel: mongoose.Model<IConversationDocument> = mongoose.model<IConversationDocument>('Conversation', conversationSchema, 'Conversation');
export { ConversationModel };