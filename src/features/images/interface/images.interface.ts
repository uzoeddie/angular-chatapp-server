import mongoose from 'mongoose';

interface Images {
    imgVersion: number,
    imgId: string,
    createdAt?: Date,
    _id?: mongoose.Types.ObjectId
}

export interface Image {
    image: string;
    type?: 'image' | 'profile';
}

export interface IFileImageDocument extends mongoose.Document {
    userId: mongoose.Types.ObjectId;
    bgImageVersion: number;
    bgImageId: string;
    profilePicture: string;
    images: Images[];
}