/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { globalMockRequest, globalMockResponse } from '@mock/global.mock';
import { AuthMiddleware } from '@global/auth-middlewares';
import { authUserPayload } from '@mock/auth.mock';

jest.mock('jsonwebtoken');

describe('AuthMiddleware', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyUser', () => {
    it('should throw error if no token is present', () => {
      const req: Request = globalMockRequest({}) as Request;
      const res: Response = globalMockResponse();
      const next: NextFunction = jest.fn();

      try {
        AuthMiddleware.prototype.verifyUser(req, res, next);
      } catch (error: any) {
        expect(error.statusCode).toEqual(401);
        expect(error.serializeErrors().message).toBe('Token is not available.');
      }
    });

    it('should throw error if no token is invalid', () => {
      const req: Request = globalMockRequest({ jwt: '12345djdj' }) as Request;
      const res: Response = globalMockResponse();
      const next: NextFunction = jest.fn();

      try {
        AuthMiddleware.prototype.verifyUser(req, res, next);
      } catch (error: any) {
        expect(error.statusCode).toEqual(401);
        expect(error.serializeErrors().message).toBe('Token is invalid.');
      }
    });

    it('should set currentUser payload in request', () => {
      const req: Request = globalMockRequest({ jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MDI2M2YxNDY0OGZlZDUyNDZlMzIyZDkiLCJ1SWQiOiIxNjIxNjEzMTE5MjUyMDY2IiwidXNlcm5hbWUiOiJNYW5ueSIsImVtYWlsIjoibWFubnlAbWUuY29tIiwiYXZhdGFyQ29sb3IiOiIjOWMyN2IwIn0.c9lc4M8KYgJ01fCWHC4D7reaDYRHvORhU0flMxqNCQs' }) as Request;
      const res: Response = globalMockResponse();
      const next: NextFunction = jest.fn();
      jest.spyOn(jwt, 'verify').mockImplementation(() => authUserPayload);

      AuthMiddleware.prototype.verifyUser(req, res, next);
      expect(req.currentUser).toEqual(authUserPayload);
    });
  });

  describe('checkAuthentication', () => {
    it('should throw error if currentUser is not present in request', () => {
      const req: Request = globalMockRequest({}) as Request;
      const res: Response = globalMockResponse();
      const next: NextFunction = jest.fn();

      try {
        AuthMiddleware.prototype.checkAuthentication(req, res, next);
      } catch (error: any) {
        expect(error.statusCode).toEqual(401);
        expect(error.serializeErrors().message).toBe('Authentication is required to access this route.');
      }
    });

    it('should call next function if currentUser is present in request', () => {
      const req: Request = globalMockRequest({}, authUserPayload) as Request;
      const res: Response = globalMockResponse();
      const next: NextFunction = jest.fn();

      AuthMiddleware.prototype.checkAuthentication(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});
