import { BaseModel, Ingredient } from "@/types/base.types";

export interface Recipe extends BaseModel {
  title: string;
  ingredients: Ingredient[];
  instructions: string[];
  cookingTime: number;
  difficulty: string;
  appliances: string[];
  metadata?: Record<string, any>;
  embedding: Record<string, number[]>;
}

export interface CreateRecipeDto {
  title: string;
  ingredients: Ingredient[];
  instructions: string[];
  cookingTime: number;
  difficulty: string;
  appliances: string[];
  metadata?: Record<string, any>;
}

export interface UpdateRecipeDto extends Partial<CreateRecipeDto> {}

export interface RecipeSearchContext {
  fridgeItems: string[];
  appliances: string[];
  maxCookingTime?: number;
}
