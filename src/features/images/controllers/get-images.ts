import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ImageModel } from '@images/models/images.schema';
import { IFileImageDocument } from '@images/interface/images.interface';
export class Get {
  public async images(req: Request, res: Response): Promise<void> {
    const images: Promise<IFileImageDocument> = await ImageModel.findOne({ userId: req.params.userId }).lean();
    res.status(HTTP_STATUS.OK).json({ message: 'User images', images });
  }
}
