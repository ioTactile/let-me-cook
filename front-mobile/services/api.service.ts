import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, Recipe, FridgeItem, Appliance, ShoppingList } from "@/types";
import {
  AuthResponse,
  CreateApplianceDto,
  CreateFridgeItemDto,
  CreateShoppingListDto,
  CreateShoppingListItemDto,
  UpdateShoppingListItemsDto,
} from "@/types/api.dto";
import { transformEmptyStringsToNull } from "@/utils/transform-empty-string-to-null";

const API_URL = process.env.API_URL || "http://192.168.1.55:8000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    return data;
  },
  register: async (
    email: string,
    password: string,
    username: string
  ): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/register", {
      email,
      password,
      username,
    });
    return data;
  },
  logout: async (): Promise<void> => {
    // Le token est retiré par le store auth
  },
  getUser: async (): Promise<User> => {
    const { data } = await api.get<User>("/auth/me");
    return data;
  },
};

export const recipes = {
  getSimilar: async (payload: {
    fridgeItems: string[];
    appliances: string[];
    maxCookingTime: number;
  }): Promise<Recipe[]> => {
    const { data } = await api.post<Recipe[]>("/recipes/similar", payload);
    return data;
  },
  getById: async (id: string): Promise<Recipe> => {
    const { data } = await api.get<Recipe>(`/recipes/${id}`);
    return data;
  },
  create: async (
    payload: Omit<Recipe, "id" | "createdAt" | "updatedAt" | "embedding">
  ): Promise<Recipe> => {
    const { data } = await api.post<Recipe>("/recipes", payload);
    return data;
  },
  update: async (id: string, payload: Partial<Recipe>): Promise<Recipe> => {
    const { data } = await api.put<Recipe>(`/recipes/${id}`, payload);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/recipes/${id}`);
  },
};

export const fridge = {
  getAll: async (): Promise<FridgeItem[]> => {
    const { data } = await api.get<FridgeItem[]>("/fridge");
    return data;
  },
  getById: async (id: string): Promise<FridgeItem> => {
    const { data } = await api.get<FridgeItem>(`/fridge/${id}`);
    return data;
  },
  create: async (payload: CreateFridgeItemDto): Promise<FridgeItem> => {
    const { data } = await api.post<FridgeItem>(
      "/fridge",
      transformEmptyStringsToNull(payload)
    );
    return data;
  },
  update: async (
    id: string,
    payload: Partial<CreateFridgeItemDto>
  ): Promise<FridgeItem> => {
    const { data } = await api.put<FridgeItem>(
      `/fridge/${id}`,
      transformEmptyStringsToNull(payload)
    );
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/fridge/${id}`);
  },
};

export const appliances = {
  getAll: async (): Promise<Appliance[]> => {
    const { data } = await api.get<Appliance[]>("/appliances");
    return data;
  },
  getById: async (id: string): Promise<Appliance> => {
    const { data } = await api.get<Appliance>(`/appliances/${id}`);
    return data;
  },
  create: async (payload: CreateApplianceDto): Promise<Appliance> => {
    const { data } = await api.post<Appliance>("/appliances", payload);
    return data;
  },
  update: async (
    id: string,
    payload: Partial<CreateApplianceDto>
  ): Promise<Appliance> => {
    const { data } = await api.put<Appliance>(`/appliances/${id}`, payload);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/appliances/${id}`);
  },
};

export type FrequentItem = {
  ingredientName: string;
  count: number;
  imageUrl: string | null;
};

export const shoppingLists = {
  getAll: async (): Promise<ShoppingList[]> => {
    const { data } = await api.get<ShoppingList[]>("/shopping-lists");
    return data;
  },
  getById: async (id: string): Promise<ShoppingList> => {
    const { data } = await api.get<ShoppingList>(`/shopping-lists/${id}`);
    return data;
  },
  create: async (payload: CreateShoppingListDto): Promise<ShoppingList> => {
    const { data } = await api.post<ShoppingList>("/shopping-lists", payload);
    return data;
  },
  update: async (
    id: string,
    payload: UpdateShoppingListItemsDto
  ): Promise<ShoppingList> => {
    const { data } = await api.put<ShoppingList>(
      `/shopping-lists/${id}`,
      payload
    );
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/shopping-lists/${id}`);
  },
  validate: async (id: string): Promise<ShoppingList> => {
    const { data } = await api.post<ShoppingList>(
      `/shopping-lists/${id}/validate`
    );
    return data;
  },
  getFrequentItems: async (limit: number = 10): Promise<FrequentItem[]> => {
    const { data } = await api.get<FrequentItem[]>(
      `/shopping-lists/frequent-items?limit=${limit}`
    );
    return data;
  },
  searchItems: async (
    searchTerm: string,
    limit: number = 10
  ): Promise<FrequentItem[]> => {
    const { data } = await api.get<FrequentItem[]>(
      `/shopping-lists/search-items?searchTerm=${searchTerm}&limit=${limit}`
    );
    return data;
  },
  createItem: async (
    id: string,
    payload: CreateShoppingListItemDto
  ): Promise<ShoppingList> => {
    const { data } = await api.post<ShoppingList>(
      `/shopping-lists/${id}/items`,
      payload
    );
    return data;
  },
  updateItem: async (
    id: string,
    itemId: string,
    payload: UpdateShoppingListItemsDto
  ): Promise<ShoppingList> => {
    const { data } = await api.put<ShoppingList>(
      `/shopping-lists/${id}/items/${itemId}`,
      payload
    );
    return data;
  },
  deleteItem: async (id: string, itemId: string): Promise<void> => {
    await api.delete(`/shopping-lists/${id}/items/${itemId}`);
  },
};

export const ai = {
  generateRecipe: async ({
    ingredients,
    appliances: applianceNames,
  }: {
    ingredients: string[];
    appliances: string[];
  }) => {
    const { data } = await api.post("/ai/suggest-recipes", {
      ingredients,
      appliances: applianceNames,
    });
    return data;
  },
  analyzeRecipe: async (recipe: string) => {
    const { data } = await api.post("/ai/analyze-recipe", { recipe });
    return data;
  },
  generateShoppingList: async (recipe: string) => {
    const { data } = await api.post("/ai/generate-shopping-list", { recipe });
    return data;
  },
};
