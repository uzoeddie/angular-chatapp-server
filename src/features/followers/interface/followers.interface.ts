import mongoose from 'mongoose';

export interface IFollowing {
    userId: string;
};

export interface IFollowers {
    userId: string;
}

export interface IFollowerDocument extends mongoose.Document {
    followerId: mongoose.Types.ObjectId;
    followeeId: mongoose.Types.ObjectId;
    createdAt: Date;
}
