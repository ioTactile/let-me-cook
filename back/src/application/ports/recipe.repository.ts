import {
  Recipe,
  CreateRecipeDto,
  UpdateRecipeDto,
  RecipeSearchContext,
} from '@/types/recipe.types';

export interface RecipeRepository {
  create(data: CreateRecipeDto, embedding: Record<string, number[]>): Promise<Recipe>;
  findById(id: string): Promise<Recipe | null>;
  update(id: string, data: UpdateRecipeDto, embedding: Record<string, number[]>): Promise<Recipe>;
  delete(id: string): Promise<void>;
  findSimilar(
    context: RecipeSearchContext,
    embeddings: { ingredients: number[]; appliances: number[] },
  ): Promise<Recipe[]>;
}
