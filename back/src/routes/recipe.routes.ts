import { Router } from "express";
import {
  cacheMiddleware,
  invalidateCache,
} from "@/middleware/cache.middleware";
import { recipeController } from "@/controllers/recipe.controller";

const router: Router = Router();

// Trouver des recettes similaires
router.post("/similar", recipeController.findSimilarRecipes);

// Obtenir une recette par son ID
router.get("/:id", cacheMiddleware, recipeController.getRecipeById);

// Créer une nouvelle recette
router.post("/", invalidateCache, recipeController.createRecipe);

// Mettre à jour une recette
router.put("/:id", invalidateCache, recipeController.updateRecipe);

// Supprimer une recette
router.delete("/:id", invalidateCache, recipeController.deleteRecipe);

export const recipeRoutes = router;
