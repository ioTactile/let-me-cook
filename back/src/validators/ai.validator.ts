import { body } from 'express-validator';

export const aiValidators = {
  suggestRecipes: [
    body('ingredients').isArray().withMessage('Les ingrédients doivent être un tableau'),
    body('appliances').isArray().withMessage('Les appareils doivent être un tableau'),
  ],

  analyzeRecipe: [body('recipe').isString().notEmpty().withMessage('La recette est requise')],

  generateShoppingList: [
    body('recipe').isString().notEmpty().withMessage('La recette est requise'),
  ],
};
