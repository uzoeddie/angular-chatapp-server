import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { NotAuthorizedError } from '@global/error-handler';
import { AuthPayload } from '@user/interface/user.interface';
import { config } from '@root/config';
class AuthMiddleware {
  public verifyUser(req: Request, _res: Response, next: NextFunction): void {
    if (!req.headers.authorization) {
      throw new NotAuthorizedError('Token is not available...');
    }
    const token: string = req.headers.authorization.split(' ')[1];
    try {
      const payload: AuthPayload = jwt.verify(token, config.JWT_TOKEN!) as AuthPayload;
      req.currentUser = payload;
    } catch (err) {
      throw new NotAuthorizedError('Token is invalid.');
    }
    next();
  }

  public checkAuthentication(req: Request, _res: Response, next: NextFunction): void {
    if (!req.currentUser) {
      throw new NotAuthorizedError('Authentication is required to access this route...');
    }
    next();
  }
}

export const authMiddleware: AuthMiddleware = new AuthMiddleware();
