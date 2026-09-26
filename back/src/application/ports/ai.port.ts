export interface AiPort {
  generateEmbedding(text: string): Promise<number[]>;
  analyzeIngredient(ingredientName: string): Promise<string | null>;
  generateRecipeSuggestions(
    ingredients: string[],
    appliances: string[]
  ): Promise<string | null>;
  analyzeRecipe(recipe: string): Promise<string | null>;
  generateShoppingList(recipe: string): Promise<string | null>;
  generateIngredientImageUrl(ingredientName: string): Promise<string>;
}
