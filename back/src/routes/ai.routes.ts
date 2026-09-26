import { Router } from 'express';
import { validateRequest } from '@/middleware/validation.middleware';
import { aiController } from '@/controllers/ai.controller';
import { aiValidators } from '@/validators/ai.validator';

const router: Router = Router();

// Route pour générer des suggestions de recettes
router.post(
  '/suggest-recipes',
  [...aiValidators.suggestRecipes, validateRequest],
  aiController.generateRecipeSuggestions,
);

// Route pour analyser une recette
router.post(
  '/analyze-recipe',
  [...aiValidators.analyzeRecipe, validateRequest],
  aiController.analyzeRecipe,
);

// Route pour générer une liste de courses
router.post(
  '/generate-shopping-list',
  [...aiValidators.generateShoppingList, validateRequest],
  aiController.generateShoppingList,
);

export const aiRoutes = router;
