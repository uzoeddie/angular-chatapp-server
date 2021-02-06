/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from 'express';
import { ObjectSchema } from 'joi';
import { JoiRequestValidationError } from '@global/error-handler';

type IJoiDescriptor = (target: any, key: string, descriptor: PropertyDescriptor) => void;

export function joiValidation(schema: ObjectSchema): IJoiDescriptor {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const req: Request = args[0];
      // if you use validateAsync, you'll have to use a try/catch block
      const { error } = await schema.validate(req.body);
      if (error?.details) {
        throw new JoiRequestValidationError(error.details[0].message);
      }
      const result = originalMethod.apply(this, args);
      return result;
    };
    return descriptor;
  };
}
