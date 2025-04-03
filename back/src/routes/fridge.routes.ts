import { Response, NextFunction, Router } from "express";
import { FridgeService } from "@/services/fridge.service";
import { AuthenticatedRequest } from "@/types/express.types";

const router: Router = Router();

// Obtenir tous les ingrédients du frigo
router.get(
  "/",
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const items = await FridgeService.getFridgeItems(req.user.id);
      res.json(items);
    } catch (error) {
      next(error);
    }
  }
);

// Ajouter un ingrédient au frigo
router.post(
  "/",
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const item = await FridgeService.createFridgeItem({
        ...req.body,
        userId: req.user.id,
      });
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  }
);

// Mettre à jour un ingrédient
router.put(
  "/:id",
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const item = await FridgeService.updateFridgeItem(
        req.params.id,
        req.body
      );
      res.json(item);
    } catch (error) {
      next(error);
    }
  }
);

// Supprimer un ingrédient
router.delete(
  "/:id",
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await FridgeService.deleteFridgeItem(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

// Obtenir les ingrédients qui vont périmer
router.get(
  "/expiring",
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
  }
);

export const fridgeRoutes = router;
