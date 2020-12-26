import { Request, Response } from "express";
import HTTP_STATUS from 'http-status-codes';
import mongoose from 'mongoose';
import { ImageModel } from "@images/models/images.schema";

export class Delete {
    public async image(req: Request, res: Response): Promise<void> {
        await ImageModel.updateOne(
            { 
                userId: req.currentUser?.userId
            },
            {
                $pull: {
                    images: {
                        _id: mongoose.Types.ObjectId(req.params.imageId)
                    }
                },
            },
        );
    
        res.status(HTTP_STATUS.OK).json({ message: 'Image delete successfully' });
    }
}