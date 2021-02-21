import { Request, Response } from 'express';
import { AddChat } from '@chat/controllers/add-chat-message';
import { uploads } from '@global/cloudinary-upload';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { UploadApiResponse } from 'cloudinary';
import { addChatSchema } from '@chat/schemes/chat';

export class AddMessage {
  @joiValidation(addChatSchema)
  public async image(req: Request, res: Response): Promise<void> {
    const { selectedImages } = req.body;
    let uploadResult: string[] = [];

    for (const file of selectedImages) {
      const result: UploadApiResponse = (await uploads(file)) as UploadApiResponse;
      const url = `http://res.cloudinary.com/ratingapp/image/upload/v${result.version}/${result.public_id}`;
      uploadResult = [...uploadResult, url];
    }
    if (uploadResult.length === selectedImages.length) {
      req.body.selectedImages = uploadResult;
      await AddChat.prototype.message(req, res);
    }
  }
}
