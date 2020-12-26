import Joi, { ObjectSchema } from 'joi';

const addChatImageSchema: ObjectSchema<any> = Joi.object().keys({
    receiverId: Joi.string().required(),
    receiverName: Joi.string().required(),
    body: Joi.string().optional().allow(null, ''),
    gifUrl: Joi.string().optional().allow(null, ''),
    isRead: Joi.boolean().optional(),
    selectedImages: Joi.array()
});

const addImageSchema: ObjectSchema<any> = Joi.object().keys({
    image: Joi.string().required(),
    type: Joi.string().optional(),
});

const addBGImageSchema: ObjectSchema<any> = Joi.object().keys({
    image: Joi.string().required(),
});

export { addChatImageSchema, addImageSchema, addBGImageSchema }