import { Router } from "express";
import {
  cacheMiddleware,
  invalidateCache,
} from "@/middleware/cache.middleware";
import { applianceController } from "@/controllers/appliance.controller";

const router: Router = Router();

// Obtenir tous les appareils
router.get("/", cacheMiddleware, applianceController.getAppliances);

// Obtenir un appareil par son ID
router.get("/:id", cacheMiddleware, applianceController.getApplianceById);

// Ajouter un appareil
router.post("/", invalidateCache, applianceController.createAppliance);

// Mettre à jour un appareil
router.put("/:id", invalidateCache, applianceController.updateAppliance);

// Supprimer un appareil
router.delete("/:id", invalidateCache, applianceController.deleteAppliance);

export const applianceRoutes = router;
