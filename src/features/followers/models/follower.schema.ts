import mongoose from 'mongoose';
import autopopulate from 'mongoose-autopopulate';
import { IFollowerDocument } from '@followers/interface/followers.interface';

const folowerSchema: mongoose.Schema = new mongoose.Schema({
    followerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        autopopulate: {
            select: [
                'username',
                'avatarColor',
                'profilePicture',
                'postCount',
                'followersCount',
                'followingCount',
                'birthDay'
            ],
        },
        index: true
    },
    followeeId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        autopopulate: {
            select: [
                'username',
                'avatarColor',
                'profilePicture',
                'postCount',
                'followersCount',
                'followingCount',
                'birthDay'
            ],
        },
        index: true
    },
    createdAt: { type: Date, default: Date.now, index: true},
});

folowerSchema.plugin(autopopulate);
const FollowerModel: mongoose.Model<IFollowerDocument> = mongoose.model<IFollowerDocument>('Follower', folowerSchema, 'Follower');

export { FollowerModel };
