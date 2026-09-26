import { Response, NextFunction } from "express";
import { fridgeService } from "@/infrastructure/container";
import { AuthenticatedRequest } from "@/types/express.types";
import { routeParam } from "@/utils/route-param";

export const fridgeController = {
  async getFridgeItems(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const items = await fridgeService.getFridgeItems(req.user.id);
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
      const item = await fridgeService.getFridgeItemById(
        routeParam(req.params.id)
      );
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
      const item = await fridgeService.createFridgeItem({
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
      const item = await fridgeService.updateFridgeItem(
        routeParam(req.params.id),
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
      await fridgeService.deleteFridgeItem(routeParam(req.params.id));
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
      const items = await fridgeService.getExpiringItems(
        req.user.id,
        daysThreshold
      );
      res.json(items);
    } catch (error) {
      next(error);
    }
  },
};
