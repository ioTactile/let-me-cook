import { Unit, ShoppingListItemStatus } from '@/types/enums';

export type CreateFridgeItemDto = {
  ingredientName: string;
  quantity: number;
  unit: string;
  expiryDate: Date | null;
};

export type CreateApplianceDto = {
  name: string;
  description: string | null;
};

export type CreateShoppingListItemDto = {
  ingredientName: string;
  quantity: number;
  unit: Unit;
};

export type CreateShoppingListDto = {
  name: string;
  items: CreateShoppingListItemDto[];
};

export type UpdateShoppingListItemsDto = {
  items: {
    id: string;
    status?: ShoppingListItemStatus;
    quantity?: number;
    unit?: Unit;
  }[];
};

export type AuthResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
};
