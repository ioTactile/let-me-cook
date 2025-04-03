import { BaseModel } from "@/types/base.types";

export interface ShoppingListItem extends BaseModel {
  shoppingListId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  status: string;
}

export interface ShoppingList extends BaseModel {
  userId: string;
  name: string;
  status: string;
  metadata: Record<string, any> | null;
  items: ShoppingListItem[];
}

export interface CreateShoppingListDto {
  userId: string;
  name: string;
  status: string;
  metadata: Record<string, any> | null;
  items: CreateShoppingListItemDto[];
}

export interface UpdateShoppingListDto extends Partial<CreateShoppingListDto> {}

export interface CreateShoppingListItemDto {
  shoppingListId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  status: string;
}

export interface UpdateShoppingListItemDto
  extends Partial<CreateShoppingListItemDto> {}
