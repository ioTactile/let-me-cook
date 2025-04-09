import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, Recipe, FridgeItem, Appliance, ShoppingList } from "@/types";
import { transformEmptyStringsToNull } from "@/utils/transform-empty-string-to-null";
import { CreateApplianceInputs } from "@/app/appliance/_schemas/create-appliance";
import { CreateFridgeItemInputs } from "@/app/fridge/_schemas/create-fridge-item";
import { CreateShoppingListInputs } from "@/app/shopping/_schemas/create-shopping-list";
import { UpdateShoppingListItemInputs } from "@/app/shopping/_schemas/update-shopping-list-item";
import { CreateShoppingListItemInputs } from "@/app/shopping/_schemas/create-shopping-list-item";

const API_URL = process.env.API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const auth = {
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    await AsyncStorage.setItem("token", response.data.token);
    return response.data;
  },
  register: async (email: string, password: string, username: string) => {
    const response = await api.post("/auth/register", {
      email,
      password,
      username,
    });
    await AsyncStorage.setItem("token", response.data.token);
    return response.data;
  },
  logout: async () => {
    await AsyncStorage.removeItem("token");
  },
  getUser: async () => {
    const response = await api.get("/auth/me");
    return response.data as User;
  },
};

// Recipes
export const recipes = {
  getSimilar: (data: {
    fridgeItems: string[];
    appliances: string[];
    maxCookingTime: number;
  }) => api.post<Recipe[]>("/recipes/similar", data),
  getById: (id: string) => api.get<Recipe>(`/recipes/${id}`),
  create: (data: Omit<Recipe, "id" | "userId" | "createdAt" | "updatedAt">) =>
    api.post<Recipe>("/recipes", data),
  update: (id: string, data: Partial<Recipe>) =>
    api.put<Recipe>(`/recipes/${id}`, data),
  delete: (id: string) => api.delete(`/recipes/${id}`),
};

// Fridge
export const fridge = {
  getAll: () => api.get<FridgeItem[]>("/fridge"),
  getById: (id: string) => api.get<FridgeItem>(`/fridge/${id}`),
  create: (data: CreateFridgeItemInputs) =>
    api.post<FridgeItem>("/fridge", transformEmptyStringsToNull(data)),
  update: (id: string, data: Partial<CreateFridgeItemInputs>) =>
    api.put<FridgeItem>(`/fridge/${id}`, transformEmptyStringsToNull(data)),
  delete: (id: string) => api.delete(`/fridge/${id}`),
};

// Appliances
export const appliances = {
  getAll: () => api.get<Appliance[]>("/appliances"),
  getById: (id: string) => api.get<Appliance>(`/appliances/${id}`),
  create: (data: CreateApplianceInputs) =>
    api.post<Appliance>("/appliances", data),
  update: (id: string, data: Partial<CreateApplianceInputs>) =>
    api.put<Appliance>(`/appliances/${id}`, data),
  delete: (id: string) => api.delete(`/appliances/${id}`),
};

// Shopping Lists
export const shoppingLists = {
  getAll: () => api.get<ShoppingList[]>("/shopping-lists"),
  getById: (id: string) => api.get<ShoppingList>(`/shopping-lists/${id}`),
  create: (data: CreateShoppingListInputs) =>
    api.post<ShoppingList>("/shopping-lists", data),
  update: (id: string, data: UpdateShoppingListItemInputs) =>
    api.put<ShoppingList>(`/shopping-lists/${id}`, data),

  delete: (id: string) => api.delete(`/shopping-lists/${id}`),
  validate: (id: string) => api.post(`/shopping-lists/${id}/validate`),
  getFrequentItems: (limit: number = 10) =>
    api.get<
      { ingredientName: string; count: number; imageUrl: string | null }[]
    >(`/shopping-lists/frequent-items?limit=${limit}`),
  searchItems: (searchTerm: string, limit: number = 10) =>
    api.get<
      { ingredientName: string; count: number; imageUrl: string | null }[]
    >(`/shopping-lists/search-items?searchTerm=${searchTerm}&limit=${limit}`),
  createItem: (id: string, data: CreateShoppingListItemInputs) =>
    api.post<ShoppingList>(`/shopping-lists/${id}/items`, data),
  updateItem: (
    id: string,
    itemId: string,
    data: UpdateShoppingListItemInputs
  ) => api.put<ShoppingList>(`/shopping-lists/${id}/items/${itemId}`, data),
  deleteItem: (id: string, itemId: string) =>
    api.delete(`/shopping-lists/${id}/items/${itemId}`),
};

// AI
export const ai = {
  generateRecipe: async ({
    ingredients,
    appliances,
  }: {
    ingredients: string[];
    appliances: string[];
  }) => {
    const response = await api.post("/ai/suggest-recipes", {
      ingredients,
      appliances,
    });
    return response.data;
  },
  analyzeRecipe: async (recipe: string) => {
    const response = await api.post("/ai/analyze-recipe", { recipe });
    return response.data;
  },
  generateShoppingList: async (recipe: string) => {
    const response = await api.post("/ai/generate-shopping-list", { recipe });
    return response.data;
  },
};
