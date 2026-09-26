import { Router } from 'express';
import { cacheMiddleware, invalidateCache } from '@/middleware/cache.middleware';
import { shoppingListController } from '@/controllers/shopping-list.controller';

const router: Router = Router();

// Obtenir les items fréquents
router.get('/frequent-items', cacheMiddleware, shoppingListController.getFrequentItems);

// Rechercher des items
router.get('/search-items', shoppingListController.searchItems);

// Obtenir toutes les listes de courses
router.get('/', cacheMiddleware, shoppingListController.getShoppingLists);

// Obtenir une liste de courses par son ID
router.get('/:id', cacheMiddleware, shoppingListController.getShoppingListById);

// Créer une nouvelle liste de courses
router.post('/', invalidateCache, shoppingListController.createShoppingList);

// Mettre à jour une liste de courses
router.put('/:id', invalidateCache, shoppingListController.updateShoppingList);

// Supprimer une liste de courses
router.delete('/:id', invalidateCache, shoppingListController.deleteShoppingList);

// Ajouter un item à une liste
router.post('/:id/items', invalidateCache, shoppingListController.addShoppingListItem);

// Mettre à jour un item d'une liste
router.put('/:id/items/:itemId', invalidateCache, shoppingListController.updateShoppingListItem);

// Supprimer un item d'une liste
router.delete('/:id/items/:itemId', invalidateCache, shoppingListController.deleteShoppingListItem);

// Valider une liste de courses (transférer les items au frigo)
router.post('/:id/validate', invalidateCache, shoppingListController.validateShoppingList);

export const shoppingListRoutes = router;
