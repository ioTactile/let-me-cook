import { Request, Response, NextFunction, Router } from "express";
import { RecipeService } from "@/services/recipe.service";

const router: Router = Router();

// Créer une nouvelle recette
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recipe = await RecipeService.createRecipe(req.body);
    res.status(201).json(recipe);
  } catch (error) {
    next(error);
  }
});

// Trouver des recettes similaires
router.post(
  "/similar",
  async (req: Request, res: Response, next: NextFunction) => {
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
  }
);

// Obtenir une recette par son ID
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recipe = await RecipeService.getRecipeById(req.params.id);
    res.json(recipe);
  } catch (error) {
    next(error);
  }
});

// Mettre à jour une recette
router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recipe = await RecipeService.updateRecipe(req.params.id, req.body);
    res.json(recipe);
  } catch (error) {
    next(error);
  }
});

// Supprimer une recette
router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await RecipeService.deleteRecipe(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export const recipeRoutes = router;
