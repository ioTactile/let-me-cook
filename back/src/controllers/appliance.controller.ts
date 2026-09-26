import { Response, NextFunction } from "express";
import { applianceService } from "@/infrastructure/container";
import { AuthenticatedRequest } from "@/types/express.types";
import { routeParam } from "@/utils/route-param";

export const applianceController = {
  async getAppliances(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const appliances = await applianceService.getAppliances(req.user.id);
      res.json(appliances);
    } catch (error) {
      next(error);
    }
  },

  async getApplianceById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const appliance = await applianceService.getApplianceById(
        routeParam(req.params.id)
      );
      if (!appliance) {
        res.status(404).json({ message: "Appareil non trouvé" });
        return;
      }
      res.json(appliance);
    } catch (error) {
      next(error);
    }
  },

  async createAppliance(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const appliance = await applianceService.createAppliance({
        ...req.body,
        userId: req.user.id,
      });
      res.status(201).json(appliance);
    } catch (error) {
      next(error);
    }
  },

  async updateAppliance(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const appliance = await applianceService.updateAppliance(
        routeParam(req.params.id),
        req.body
      );
      res.json(appliance);
    } catch (error) {
      next(error);
    }
  },

  async deleteAppliance(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await applianceService.deleteAppliance(routeParam(req.params.id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
