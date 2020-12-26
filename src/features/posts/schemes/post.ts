import Joi, { ObjectSchema } from 'joi';

const addPostSchema: ObjectSchema<any> = Joi.object().keys({
    post: Joi.string().optional().allow(null, ''),
    bgColor: Joi.string().optional().allow(null, ''),
    feelings: Joi.object().optional().allow(null, ''),
    privacy: Joi.object().optional().allow(null, ''),
    gifUrl: Joi.string().optional().allow(null, ''),
    image: Joi.string().optional().allow(null, ''),
    imgId: Joi.string().optional().allow(null, ''),
    imgVersion: Joi.string().optional().allow(null, ''),
    profilePicture: Joi.string().optional().allow(null, ''),
});

const postWithImageSchema: ObjectSchema<any> = Joi.object().keys({
    image: Joi.string().required(),
    post: Joi.string().optional().allow(null, ''),
    bgColor: Joi.string().optional().allow(null, ''),
    privacy: Joi.object().optional().allow(null, ''),
    feelings: Joi.object().optional().allow(null, ''),
    gifUrl: Joi.string().optional().allow(null, ''),
    imgId: Joi.string().optional().allow(null, ''),
    imgVersion: Joi.string().optional().allow(null, ''),
    profilePicture: Joi.string().optional().allow(null, ''),
});

const editPostSchema: ObjectSchema<any> = Joi.object().keys({
    post: Joi.string().optional().allow(null, ''),
    bgColor: Joi.string().optional().allow(null, ''),
    feelings: Joi.object().optional().allow(null, ''),
    privacy: Joi.object().optional().allow(null, ''),
    gifUrl: Joi.string().optional().allow(null, ''),
    image: Joi.string().optional().allow(null, ''),
    imgId: Joi.string().optional().allow(null, ''),
    imgVersion: Joi.string().optional().allow(null, ''),
    profilePicture: Joi.string().optional().allow(null, ''),
});

const editPostWithImageSchema: ObjectSchema<any> = Joi.object().keys({
    image: Joi.string().optional().allow(null, ''),
    post: Joi.string().optional().allow(null, ''),
    bgColor: Joi.string().optional().allow(null, ''),
    privacy: Joi.object().optional().allow(null, ''),
    feelings: Joi.object().optional().allow(null, ''),
    gifUrl: Joi.string().optional().allow(null, ''),
    imgId: Joi.string().optional().allow(null, ''),
    imgVersion: Joi.string().optional().allow(null, ''),
    profilePicture: Joi.string().optional().allow(null, ''),
});

export { addPostSchema, postWithImageSchema, editPostSchema, editPostWithImageSchema }