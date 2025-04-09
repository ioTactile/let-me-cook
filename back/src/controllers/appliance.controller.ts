import { Response, NextFunction } from "express";
import { ApplianceService } from "@/services/appliance.service";
import { AuthenticatedRequest } from "@/types/express.types";

export const applianceController = {
  async getAppliances(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const appliances = await ApplianceService.getAppliances(req.user.id);
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
      const appliance = await ApplianceService.getApplianceById(req.params.id);
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
      const appliance = await ApplianceService.createAppliance({
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
      const appliance = await ApplianceService.updateAppliance(
        req.params.id,
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
      await ApplianceService.deleteAppliance(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
