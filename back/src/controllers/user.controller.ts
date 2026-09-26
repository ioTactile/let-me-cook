import { Request, Response, NextFunction } from 'express';
import { authService } from '@/infrastructure/container';
import { ExpressSessionAdapter } from '@/infrastructure/session/express-session.adapter';
import { AuthenticatedRequest } from '@/types/express.types';

export const userController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const session = new ExpressSessionAdapter(req.session);
      const result = await authService.register(req.body, session);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const session = new ExpressSessionAdapter(req.session);
      const result = await authService.login(req.body, session);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const session = new ExpressSessionAdapter(req.session);
      await authService.logout(session);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async getCurrentUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.getCurrentUser(req.user.id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  },
};
