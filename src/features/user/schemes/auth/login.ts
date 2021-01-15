import Joi, { ObjectSchema } from 'joi';

const schema: ObjectSchema = Joi.object().keys({
  username: Joi.string().required().min(4).max(8).messages({
    'string.base': 'Username should be a type of string',
    'string.min': 'Username must have a minimum length of {#limit}',
    'string.max': 'Username should have a maximum length of {#limit}',
    'string.empty': 'Username is a required field'
  }),
  password: Joi.string().required().min(4).max(8).messages({
    'string.base': 'Password should be a type of string',
    'string.min': 'Password must have a minimum length of {#limit}',
    'string.max': 'Password should have a maximum length of {#limit}',
    'string.empty': 'Password is a required field'
  }),
  keepLoggedIn: Joi.boolean().optional()
});
export { schema as loginSchema };
