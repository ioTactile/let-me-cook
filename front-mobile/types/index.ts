import { ShoppingListItemStatus, ShoppingListStatus } from '@/types/enums';

export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface Recipe {
  id: string;
  title: string;
  ingredients: Ingredient[];
  instructions: string[];
  cookingTime: number;
  difficulty: string;
  appliances: string[];
  metadata?: Record<string, any>;
  embedding: Record<string, number[]>;
  createdAt: string;
  updatedAt: string;
}

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface FridgeItem {
  id: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  expirationDate?: string;
  metadata?: Record<string, any>;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appliance {
  id: string;
  name: string;
  description?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  status: ShoppingListStatus;
  items: ShoppingListItem[];
  metadata?: Record<string, any>;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingListItem {
  id: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  status: ShoppingListItemStatus;
  shoppingListId: string;
  imageUrl?: string;
}

export interface RecipeSearchContext {
  fridgeItems: string[];
  appliances: string[];
  maxCookingTime?: number;
}
