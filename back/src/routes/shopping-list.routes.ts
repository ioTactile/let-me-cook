import { Response, NextFunction, Router } from "express";
import { ShoppingListService } from "@/services/shopping-list.service";
import { AuthenticatedRequest } from "@/types/express.types";

const router: Router = Router();

// Obtenir toutes les listes de courses
router.get(
  "/",
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const lists = await ShoppingListService.getShoppingLists(req.user.id);
      res.json(lists);
    } catch (error) {
      next(error);
    }
  }
);

// Créer une nouvelle liste de courses
router.post(
  "/",
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const list = await ShoppingListService.createShoppingList({
        ...req.body,
        userId: req.user.id,
      });
      res.status(201).json(list);
    } catch (error) {
      next(error);
    }
  }
);

// Mettre à jour une liste de courses
router.put(
  "/:id",
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const list = await ShoppingListService.updateShoppingList(
        req.params.id,
        req.body
      );
      res.json(list);
    } catch (error) {
      next(error);
    }
  }
);

// Supprimer une liste de courses
router.delete(
  "/:id",
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await ShoppingListService.deleteShoppingList(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

// Ajouter un item à une liste
router.post(
  "/:id/items",
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const item = await ShoppingListService.addShoppingListItem({
        ...req.body,
        shoppingListId: req.params.id,
      });
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  }
);

// Mettre à jour un item d'une liste
router.put(
  "/:id/items/:itemId",
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const item = await ShoppingListService.updateShoppingListItem(
        req.params.itemId,
        req.body
      );
      res.json(item);
    } catch (error) {
      next(error);
    }
  }
);

// Supprimer un item d'une liste
router.delete(
  "/:id/items/:itemId",
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await ShoppingListService.deleteShoppingListItem(req.params.itemId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

// Valider une liste de courses (transférer les items au frigo)
router.post(
  "/:id/validate",
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const list = await ShoppingListService.updateShoppingList(req.params.id, {
        status: "completed",
      });
      res.json(list);
    } catch (error) {
      next(error);
    }
  }
);

export const shoppingListRoutes = router;
