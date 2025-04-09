import { Request, Response, NextFunction } from "express";
import { AuthService } from "@/services/auth.service";
import { AuthenticatedRequest } from "@/types/express.types";

export const userController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body, req);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body, req);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      await AuthService.logout(req);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async getCurrentUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = await AuthService.getCurrentUser(req.user.id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  },
};
