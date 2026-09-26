import { BaseModel } from "./base.types";

export interface FridgeItem extends BaseModel {
  userId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  expirationDate: Date | null;
  metadata: Record<string, any> | null;
}

export interface CreateFridgeItemDto {
  userId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  expirationDate: Date | null;
  metadata: Record<string, any> | null;
}

export type UpdateFridgeItemDto = Partial<CreateFridgeItemDto>;
