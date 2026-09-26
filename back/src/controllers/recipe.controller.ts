import { Response, NextFunction } from 'express';
import { recipeService } from '@/infrastructure/container';
import { AuthenticatedRequest } from '@/types/express.types';
import { routeParam } from '@/utils/route-param';

export const recipeController = {
  async createRecipe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const recipe = await recipeService.createRecipe(req.body);
      res.status(201).json(recipe);
    } catch (error) {
      next(error);
    }
  },

  async getRecipeById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const recipe = await recipeService.getRecipeById(routeParam(req.params.id));
      res.json(recipe);
    } catch (error) {
      next(error);
    }
  },

  async findSimilarRecipes(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { fridgeItems, appliances, maxCookingTime } = req.body;
      const recipes = await recipeService.findSimilarRecipes({
        fridgeItems,
        appliances,
        maxCookingTime,
      });
      res.json(recipes);
    } catch (error) {
      next(error);
    }
  },

  async updateRecipe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const recipe = await recipeService.updateRecipe(routeParam(req.params.id), req.body);
      res.json(recipe);
    } catch (error) {
      next(error);
    }
  },

  async deleteRecipe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await recipeService.deleteRecipe(routeParam(req.params.id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
