import mongoose from 'mongoose';
export interface IParticipants {
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
}

export interface IConversationDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  participants: IParticipants[];
}
