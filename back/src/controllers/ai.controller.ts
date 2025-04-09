import { Request, Response } from "express";
import { OpenAIService } from "@/services/openai.service";

export const aiController = {
  async generateRecipeSuggestions(req: Request, res: Response) {
    const { ingredients, appliances } = req.body;
    const suggestions = await OpenAIService.generateRecipeSuggestions(
      ingredients,
      appliances
    );
    res.json({ suggestions });
  },

  async analyzeRecipe(req: Request, res: Response) {
    const { recipe } = req.body;
    const analysis = await OpenAIService.analyzeRecipe(recipe);
    res.json({ analysis });
  },

  async generateShoppingList(req: Request, res: Response) {
    const { recipe } = req.body;
    const shoppingList = await OpenAIService.generateShoppingList(recipe);
    res.json({ shoppingList });
  },
};
