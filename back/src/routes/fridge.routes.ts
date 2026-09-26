import { Router } from 'express';
import { cacheMiddleware, invalidateCache } from '@/middleware/cache.middleware';
import { fridgeController } from '@/controllers/fridge.controller';

const router: Router = Router();

// Obtenir les ingrédients qui vont périmer
router.get('/expiring', fridgeController.getExpiringItems);

// Obtenir tous les ingrédients du frigo
router.get('/', cacheMiddleware, fridgeController.getFridgeItems);

// Obtenir un ingrédient du frigo par son id
router.get('/:id', cacheMiddleware, fridgeController.getFridgeItemById);

// Ajouter un ingrédient au frigo
router.post('/', invalidateCache, fridgeController.createFridgeItem);

// Mettre à jour un ingrédient
router.put('/:id', invalidateCache, fridgeController.updateFridgeItem);

// Supprimer un ingrédient
router.delete('/:id', invalidateCache, fridgeController.deleteFridgeItem);

export const fridgeRoutes = router;
