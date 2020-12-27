import Joi, { ObjectSchema } from 'joi';

const addChatImageSchema: ObjectSchema = Joi.object().keys({
  receiverId: Joi.string().required(),
  receiverName: Joi.string().required(),
  body: Joi.string().optional().allow(null, ''),
  gifUrl: Joi.string().optional().allow(null, ''),
  isRead: Joi.boolean().optional(),
  selectedImages: Joi.array()
});

const addImageSchema: ObjectSchema = Joi.object().keys({
  image: Joi.string().required()
});

const addBGImageSchema: ObjectSchema = Joi.object().keys({
  image: Joi.string().required()
});

export { addChatImageSchema, addImageSchema, addBGImageSchema };
