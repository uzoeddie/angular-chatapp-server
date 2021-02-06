import HTTP_STATUS from 'http-status-codes';

export interface IErrorResponse {
  message: string;
  statusCode: number;
  status: string;
  serializeErrors(): IError;
}

export interface IError {
  message: string;
  statusCode: number;
  status: string;
}

export abstract class CustomError extends Error {
  abstract statusCode: number;
  status: string;

  constructor(message: string) {
    super(message);
    this.status = 'error';
  }

  serializeErrors(): IError {
    return { message: this.message, statusCode: this.statusCode, status: this.status };
  }
}

export class JoiRequestValidationError extends CustomError {
  statusCode = HTTP_STATUS.BAD_REQUEST;

  constructor(message: string) {
    super(message);
  }
}

export class BadRequestError extends CustomError {
  statusCode = HTTP_STATUS.BAD_REQUEST;

  constructor(message: string) {
    super(message);
    this.message = message;
  }
}

export class NotFoundError extends CustomError {
  statusCode = HTTP_STATUS.NOT_FOUND;

  constructor(public message: string) {
    super(message);
  }
}

export class NotAuthorizedError extends CustomError {
  statusCode = HTTP_STATUS.UNAUTHORIZED;

  constructor(public message: string) {
    super(message);
  }
}

export class ServerSideError extends CustomError {
  statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;

  constructor(public message: string) {
    super(message);
  }
}
