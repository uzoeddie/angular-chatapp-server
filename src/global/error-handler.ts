import HTTP_STATUS from 'http-status-codes';

export interface IErrorResponse {
  message: string;
  statusCode: number;
  serializeErrors(): {}
}

export interface IError {
  message: string;
  statusCode: number;
}

export abstract class CustomError extends Error {
  abstract statusCode: number;

  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, CustomError.prototype);
  }

  abstract serializeErrors(): IError;
}

export class RequestValidationError extends CustomError {
  statusCode = HTTP_STATUS.BAD_REQUEST;

  constructor(public errors: any) {
    super(errors);

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  serializeErrors(): IError {
    let errorMsg = '';
    if (!this.errors.details) {
      errorMsg = this.errors;
    } else {
      errorMsg = this.errors.details[0].message;
    }
    return { message: errorMsg, statusCode: this.statusCode };
  }
}

export class BadRequestError extends CustomError {
  statusCode = HTTP_STATUS.BAD_REQUEST;

  constructor(public message: string) {
    super(message);

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  serializeErrors(): IError {
    return { message: this.message, statusCode: this.statusCode };
  }
}

export class NotFoundError extends CustomError {
  statusCode = HTTP_STATUS.NOT_FOUND;

  constructor(public message: string) {
    super(message);

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serializeErrors(): IError {
    return { message: this.message, statusCode: this.statusCode };
  }
}

export class NotAuthorizedError extends CustomError {
  statusCode = HTTP_STATUS.UNAUTHORIZED;

  constructor(public message: string) {
    super(message);

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, NotAuthorizedError.prototype);
  }

  serializeErrors(): IError {
    return { message: this.message, statusCode: this.statusCode };
  }
}

export class ServerSideError extends CustomError {
  statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;

  constructor(public message: string) {
    super(message);

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, NotAuthorizedError.prototype);
  }

  serializeErrors(): IError {
    return { message: this.message, statusCode: this.statusCode };
  }
}