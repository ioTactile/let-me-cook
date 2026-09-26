import { BaseModel } from '@/types/base.types';
import { ShoppingListStatus, ShoppingListItemStatus, Unit } from '@/domain/enums';

export interface ShoppingListItem extends BaseModel {
  shoppingListId: string;
  ingredientName: string;
  quantity: number;
  unit: Unit;
  status: ShoppingListItemStatus;
  imageUrl?: string;
}

export interface ShoppingList extends BaseModel {
  userId: string;
  name: string;
  status: ShoppingListStatus;
  metadata: Record<string, any> | null;
  items: ShoppingListItem[];
}

export interface CreateShoppingListDto {
  userId: string;
  name: string;
  status: ShoppingListStatus;
  metadata: Record<string, any> | null;
  items: CreateShoppingListItemDto[];
}

export type UpdateShoppingListDto = Partial<CreateShoppingListDto>;

export interface CreateShoppingListItemDto {
  shoppingListId: string;
  ingredientName: string;
  quantity: number;
  unit: Unit;
  status: ShoppingListItemStatus;
  imageUrl?: string;
}

export type UpdateShoppingListItemDto = Partial<CreateShoppingListItemDto>;
