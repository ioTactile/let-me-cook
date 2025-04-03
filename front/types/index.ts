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
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  cookingTime: number;
  difficulty: "easy" | "medium" | "hard";
  userId: string;
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
  expirationDate: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appliance {
  id: string;
  name: string;
  description: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  status: "pending" | "completed" | "cancelled";
  items: ShoppingListItem[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingListItem {
  id: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  status: "pending" | "bought" | "cancelled";
  shoppingListId: string;
  createdAt: string;
  updatedAt: string;
}
