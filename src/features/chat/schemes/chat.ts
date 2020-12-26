import Joi, { ObjectSchema } from 'joi';

const addChatSchema: ObjectSchema<any> = Joi.object().keys({
    receiverId: Joi.object().required(),
    receiverName: Joi.string().required(),
    body: Joi.string().optional().allow(null, ''),
    gifUrl: Joi.string().optional().allow(null, ''),
    isRead: Joi.boolean().optional(),
    profilePicture: Joi.string().optional().allow(null, ''),
    selectedImages: Joi.array()
});

const markChatSchema: ObjectSchema<any> = Joi.object().keys({
    conversationId: Joi.string().optional().allow(null, ''),
    receiverId: Joi.string().required(),
    userId: Joi.string().required(),
});

export { addChatSchema, markChatSchema }