import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, Recipe, FridgeItem, Appliance, ShoppingList } from "@/types";

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
  getAll: () => api.get<Recipe[]>("/recipes"),
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
  create: (
    data: Omit<FridgeItem, "id" | "userId" | "createdAt" | "updatedAt">
  ) => api.post<FridgeItem>("/fridge", data),
  update: (id: string, data: Partial<FridgeItem>) =>
    api.put<FridgeItem>(`/fridge/${id}`, data),
  delete: (id: string) => api.delete(`/fridge/${id}`),
};

// Appliances
export const appliances = {
  getAll: () => api.get<Appliance[]>("/appliances"),
  getById: (id: string) => api.get<Appliance>(`/appliances/${id}`),
  create: (
    data: Omit<Appliance, "id" | "userId" | "createdAt" | "updatedAt">
  ) => api.post<Appliance>("/appliances", data),
  update: (id: string, data: Partial<Appliance>) =>
    api.put<Appliance>(`/appliances/${id}`, data),
  delete: (id: string) => api.delete(`/appliances/${id}`),
};

// Shopping Lists
export const shoppingLists = {
  getAll: () => api.get<ShoppingList[]>("/shopping-lists"),
  getById: (id: string) => api.get<ShoppingList>(`/shopping-lists/${id}`),
  create: (
    data: Omit<ShoppingList, "id" | "userId" | "createdAt" | "updatedAt">
  ) => api.post<ShoppingList>("/shopping-lists", data),
  update: (id: string, data: Partial<ShoppingList>) =>
    api.put<ShoppingList>(`/shopping-lists/${id}`, data),
  delete: (id: string) => api.delete(`/shopping-lists/${id}`),
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
