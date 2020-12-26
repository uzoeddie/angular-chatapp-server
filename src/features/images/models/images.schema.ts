import mongoose from 'mongoose';
import { IFileImageDocument } from '@images/interface/images.interface';

const imagesSchema: mongoose.Schema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    bgImageVersion: { type: String, default: '' },
    bgImageId: { type: String, default: '' },
    profilePicture: { type: String, default: '' },
    images: [
        {
            imgVersion: { type: String, default: '' },
            imgId: { type: String, default: '' },
            createdAt: { type: Date, default: Date.now },
        }
    ],
    
});

const ImageModel: mongoose.Model<IFileImageDocument> = mongoose.model<IFileImageDocument>('Image', imagesSchema, 'Image');

export { ImageModel };
