import { Router, Response, NextFunction } from "express";
import { ApplianceService } from "@/services/appliance.service";
import { AuthenticatedRequest } from "@/types/express.types";

const router: Router = Router();

// Obtenir tous les appareils
router.get(
  "/",
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const appliances = await ApplianceService.getAppliances(req.user.id);
      res.json(appliances);
    } catch (error) {
      next(error);
    }
  }
);

// Obtenir un appareil par son ID
router.get(
  "/:id",
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const appliance = await ApplianceService.getApplianceById(req.params.id);
      res.json(appliance);
    } catch (error) {
      next(error);
    }
  }
);

// Ajouter un appareil
router.post(
  "/",
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const appliance = await ApplianceService.createAppliance({
        ...req.body,
        userId: req.user.id,
      });
      res.status(201).json(appliance);
    } catch (error) {
      next(error);
    }
  }
);

// Mettre à jour un appareil
router.put(
  "/:id",
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const appliance = await ApplianceService.updateAppliance(
        req.params.id,
        req.body
      );
      res.json(appliance);
    } catch (error) {
      next(error);
    }
  }
);

// Supprimer un appareil
router.delete(
  "/:id",
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await ApplianceService.deleteAppliance(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export const applianceRoutes = router;
