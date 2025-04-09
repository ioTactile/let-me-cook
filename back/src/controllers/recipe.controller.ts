import { Response, NextFunction } from "express";
import { RecipeService } from "@/services/recipe.service";
import { AuthenticatedRequest } from "@/types/express.types";

export const recipeController = {
  async createRecipe(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const recipe = await RecipeService.createRecipe(req.body);
      res.status(201).json(recipe);
    } catch (error) {
      next(error);
    }
  },

  async getRecipeById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const recipe = await RecipeService.getRecipeById(req.params.id);
      res.json(recipe);
    } catch (error) {
      next(error);
    }
  },

  async findSimilarRecipes(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { fridgeItems, appliances, maxCookingTime } = req.body;
      const recipes = await RecipeService.findSimilarRecipes({
        fridgeItems,
        appliances,
        maxCookingTime,
      });
      res.json(recipes);
    } catch (error) {
      next(error);
    }
  },

  async updateRecipe(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const recipe = await RecipeService.updateRecipe(req.params.id, req.body);
      res.json(recipe);
    } catch (error) {
      next(error);
    }
  },

  async deleteRecipe(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await RecipeService.deleteRecipe(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
