/* eslint-disable @typescript-eslint/no-explicit-any */
import * as cloudinaryUploads from '@global/cloudinary-upload';

describe('uploads', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll((done) => {
    done();
  });

  it('should throw an error if upload fails', async () => {
    jest.spyOn(cloudinaryUploads, 'uploads').mockResolvedValue(
      Promise.reject({
        message: 'Empty file',
        http_code: 400,
        name: 'File upload'
      })
    );

    try {
      await cloudinaryUploads.uploads('test.png');
    } catch (error) {
      expect(error).toEqual({
        message: 'Empty file',
        http_code: 400,
        name: 'File upload'
      });
    }
  });

  it('should return object with version and public id if no error', async () => {
    jest.spyOn(cloudinaryUploads, 'uploads').mockImplementation((): any => Promise.resolve({ version: '1234', public_id: '123456' }));

    const response = await cloudinaryUploads.uploads('test.png');
    expect(response).toEqual({ version: '1234', public_id: '123456' });
  });
});
