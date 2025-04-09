import { Response, NextFunction } from "express";
import { FridgeService } from "@/services/fridge.service";
import { AuthenticatedRequest } from "@/types/express.types";

export const fridgeController = {
  async getFridgeItems(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const items = await FridgeService.getFridgeItems(req.user.id);
      res.json(items);
    } catch (error) {
      next(error);
    }
  },

  async getFridgeItemById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const item = await FridgeService.getFridgeItemById(req.params.id);
      res.json(item);
    } catch (error) {
      next(error);
    }
  },

  async createFridgeItem(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const item = await FridgeService.createFridgeItem({
        ...req.body,
        userId: req.user.id,
      });
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  },

  async updateFridgeItem(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const item = await FridgeService.updateFridgeItem(
        req.params.id,
        req.body
      );
      res.json(item);
    } catch (error) {
      next(error);
    }
  },

  async deleteFridgeItem(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await FridgeService.deleteFridgeItem(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async getExpiringItems(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const daysThreshold = parseInt(req.query.days as string) || 7;
      const items = await FridgeService.getExpiringItems(
        req.user.id,
        daysThreshold
      );
      res.json(items);
    } catch (error) {
      next(error);
    }
  },
};
