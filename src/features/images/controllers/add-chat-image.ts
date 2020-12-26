import { Request, Response } from "express";
import { AddChat } from "@chat/controllers/add-chat-message";
import { uploads } from "@global/cloudinary-upload";
import { joiValidation } from "@global/decorators/joi-validation.decorator";
import { addChatImageSchema } from "@images/schemes/images";
import { UploadApiResponse } from "cloudinary";

export class AddMessage {
    @joiValidation(addChatImageSchema)
    public async image(req: Request, res: Response): Promise<void> {
        const { selectedImages } = req.body;
        const uploadResult = [];

        for (const file of selectedImages) {
            const result: UploadApiResponse = await uploads(file) as UploadApiResponse;
            const url: string = `http://res.cloudinary.com/ratingapp/image/upload/v${result.version}/${result.public_id}`;
            uploadResult.push(url);
        }
        if (uploadResult.length === selectedImages.length) {
            req.body.selectedImages = uploadResult;
            await AddChat.prototype.message(req, res);
        }
    }
}