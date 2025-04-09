import { Response, NextFunction } from "express";
import { ShoppingListService } from "@/services/shopping-list.service";
import { AuthenticatedRequest } from "@/types/express.types";

export const shoppingListController = {
  async getShoppingLists(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const lists = await ShoppingListService.getShoppingLists(req.user.id);
      res.json(lists);
    } catch (error) {
      next(error);
    }
  },

  async getShoppingListById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const list = await ShoppingListService.getShoppingListById(req.params.id);
      if (!list) {
        res.status(404).json({ message: "Liste non trouvée" });
        return;
      }
      res.json(list);
    } catch (error) {
      next(error);
    }
  },

  async createShoppingList(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const list = await ShoppingListService.createShoppingList({
        ...req.body,
        userId: req.user.id,
      });
      res.status(201).json(list);
    } catch (error) {
      next(error);
    }
  },

  async updateShoppingList(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const list = await ShoppingListService.updateShoppingList(
        req.params.id,
        req.body
      );
      res.json(list);
    } catch (error) {
      next(error);
    }
  },

  async deleteShoppingList(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await ShoppingListService.deleteShoppingList(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async addShoppingListItem(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const item = await ShoppingListService.addShoppingListItem({
        ...req.body,
        shoppingListId: req.params.id,
      });
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  },

  async updateShoppingListItem(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const item = await ShoppingListService.updateShoppingListItem(
        req.params.itemId,
        req.body
      );
      res.json(item);
    } catch (error) {
      next(error);
    }
  },

  async deleteShoppingListItem(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await ShoppingListService.deleteShoppingListItem(req.params.itemId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async validateShoppingList(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const list = await ShoppingListService.updateShoppingList(req.params.id, {
        status: "completed",
      });
      res.json(list);
    } catch (error) {
      next(error);
    }
  },

  async getFrequentItems(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const items = await ShoppingListService.getFrequentItems(
        req.user.id,
        limit
      );
      res.json(items);
    } catch (error) {
      next(error);
    }
  },

  async searchItems(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { searchTerm, limit } = req.query;
      if (!searchTerm || typeof searchTerm !== "string") {
        res.status(400).json({ message: "Le terme de recherche est requis" });
        return;
      }

      console.log("searchTerm", searchTerm);

      const items = await ShoppingListService.searchItems(
        req.user.id,
        searchTerm,
        limit ? parseInt(limit as string) : 10
      );
      res.json(items);
    } catch (error) {
      next(error);
    }
  },
};
