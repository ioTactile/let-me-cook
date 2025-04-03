import { Router, Request, Response } from "express";
import { body } from "express-validator";
import { validateRequest } from "@/middleware/validation.middleware";
import { OpenAIService } from "@/services/openai.service";

const router: Router = Router();

// Route pour générer des suggestions de recettes
router.post(
  "/suggest-recipes",
  [
    body("ingredients")
      .isArray()
      .withMessage("Les ingrédients doivent être un tableau"),
    body("appliances")
      .isArray()
      .withMessage("Les appareils doivent être un tableau"),
    validateRequest,
  ],
  async (req: Request, res: Response) => {
    const { ingredients, appliances } = req.body;
    const suggestions = await OpenAIService.generateRecipeSuggestions(
      ingredients,
      appliances
    );
    res.json({ suggestions });
  }
);

// Route pour analyser une recette
router.post(
  "/analyze-recipe",
  [
    body("recipe").isString().notEmpty().withMessage("La recette est requise"),
    validateRequest,
  ],
  async (req: Request, res: Response) => {
    const { recipe } = req.body;
    const analysis = await OpenAIService.analyzeRecipe(recipe);
    res.json({ analysis });
  }
);

// Route pour générer une liste de courses
router.post(
  "/generate-shopping-list",
  [
    body("recipe").isString().notEmpty().withMessage("La recette est requise"),
    validateRequest,
  ],
  async (req: Request, res: Response) => {
    const { recipe } = req.body;
    const shoppingList = await OpenAIService.generateShoppingList(recipe);
    res.json({ shoppingList });
  }
);

export const aiRoutes = router;
