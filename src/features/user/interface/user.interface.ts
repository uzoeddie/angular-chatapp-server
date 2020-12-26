import mongoose from 'mongoose';

declare global {
    namespace Express {
      export interface Request {
        currentUser?: AuthPayload;
      }
    }
}

export interface IUserDocument extends mongoose.Document {
    _id: string;
    uId: number;
    username: string;
    email: string;
    password: string;
    avatarColor: string;
    postCount: number;
    work: IUserWork[];
    school: IUserSchool[];
    gender: string;
    birthDay: IUserBirthDay;
    relationship: string;
    quotes: string;
    about: string;
    placesLived: IUserPlacesLived[];
    blocked: [mongoose.Types.ObjectId];
    blockedBy: [mongoose.Types.ObjectId];
    followersCount: number;
    followingCount: number;
    createdAt: Date;
    bgImageVersion: number;
    bgImageId: string;
    profilePicture: string;
    passwordResetToken?: string;
    passwordResetExpires?: number;
    notifications: INotificationSettings;

    comparePassword(password: string): Promise<boolean>;
    hashPassword(password: string): Promise<string>;
}

export interface AuthPayload {
    userId: string;
    uId: number;
    email: string;
    username: string;
    avatarColor: string;
    iat?: number;
}

export interface IUserWork {
    company: string;
    position: string;
    city: string;
    description: string;
    from: string;
    to: string;
    _id?: mongoose.Types.ObjectId;
}

export interface IUserSchool {
    name: string;
    course: string;
    degree: string;
    from: string;
    to: string;
    _id?: mongoose.Types.ObjectId;
}

export interface IUserBirthDay {
    month: string;
    day: string;
}

export interface IUserPlacesLived {
    city: string;
    country: string;
    year: string;
    month: string;
    _id?: mongoose.Types.ObjectId;
}

export interface INotificationSettings {
    messages: boolean;
    reactions: boolean;
    comments: boolean;
    follows: boolean;
}
