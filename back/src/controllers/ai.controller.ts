import { Request, Response, NextFunction } from "express";
import { aiPort } from "@/infrastructure/container";

export const aiController = {
  async generateRecipeSuggestions(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { ingredients, appliances } = req.body;
      const suggestions = await aiPort.generateRecipeSuggestions(
        ingredients,
        appliances
      );
      res.json({ suggestions });
    } catch (error) {
      next(error);
    }
  },

  async analyzeRecipe(req: Request, res: Response, next: NextFunction) {
    try {
      const { recipe } = req.body;
      const analysis = await aiPort.analyzeRecipe(recipe);
      res.json({ analysis });
    } catch (error) {
      next(error);
    }
  },

  async generateShoppingList(req: Request, res: Response, next: NextFunction) {
    try {
      const { recipe } = req.body;
      const shoppingList = await aiPort.generateShoppingList(recipe);
      res.json({ shoppingList });
    } catch (error) {
      next(error);
    }
  },
};
