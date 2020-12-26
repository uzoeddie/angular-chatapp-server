import cloudinary, { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';

export const uploads = (file: string, public_id?: string, overwrite?: boolean, invalidate?: boolean) => {
    return new Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload(file, 
            { public_id, overwrite, invalidate },  (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                if (error) {
                    reject(error);
                }
                resolve(result);
            });
    });
};