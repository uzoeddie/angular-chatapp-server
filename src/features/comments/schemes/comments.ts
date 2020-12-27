import Joi, { ObjectSchema } from 'joi';

const addCommentSchema: ObjectSchema = Joi.object().keys({
  userTo: Joi.string().required(),
  postId: Joi.string().required(),
  comment: Joi.string().required(),
  profilePicture: Joi.string().optional().allow(null, '')
});

const reactionsSchema: ObjectSchema = Joi.object().keys({
  userTo: Joi.string().required(),
  postId: Joi.string().required(),
  type: Joi.string().required(),
  profilePicture: Joi.string().optional().allow(null, ''),
  previousReaction: Joi.string().optional().allow(null, '')
});

const removeReactionSchema: ObjectSchema = Joi.object().keys({
  postId: Joi.string().required(),
  previousReaction: Joi.string().required()
});

export { addCommentSchema, reactionsSchema, removeReactionSchema };
