import Joi, { ObjectSchema } from 'joi';

const schema: ObjectSchema = Joi.object().keys({
  email: Joi.string().email().required().messages({
    'string.base': 'Field must be valid',
    'any.required': 'Field must be valid',
    'string.email': 'Field must be valid'
  })
});

const schema2 = Joi.object().keys({
  password: Joi.string().required().min(4).max(8).messages({
    'string.base': 'Password should be a type of string',
    'string.min': 'Password must have a minimum length of {#limit}',
    'string.max': 'Password should have a maximum length of {#limit}',
    'string.empty': 'Password is a required field'
  }),
  cpassword: Joi.string().required().valid(Joi.ref('password')).messages({
    'any.only': 'Passwords should match'
  })
});
export { schema as passwordSchema, schema2 as passwordUpdateSchema };
