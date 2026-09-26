import {
  ShoppingList,
  ShoppingListItem,
  CreateShoppingListDto,
  UpdateShoppingListDto,
  CreateShoppingListItemDto,
  UpdateShoppingListItemDto,
} from "@/types/shopping-list.types";

export type FrequentItem = {
  ingredientName: string;
  count: number;
  imageUrl: string | null;
};

export interface ShoppingListRepository {
  create(
    data: CreateShoppingListDto,
    itemsWithImages: Array<
      CreateShoppingListItemDto & { imageUrl: string; status?: string }
    >
  ): Promise<ShoppingList>;
  findAllByUser(userId: string): Promise<ShoppingList[]>;
  findById(id: string): Promise<ShoppingList | null>;
  update(id: string, data: UpdateShoppingListDto): Promise<ShoppingList>;
  delete(id: string): Promise<void>;
  addItem(
    data: CreateShoppingListItemDto & { imageUrl: string }
  ): Promise<ShoppingListItem>;
  findItemById(id: string): Promise<ShoppingListItem | null>;
  updateItem(
    id: string,
    data: UpdateShoppingListItemDto
  ): Promise<ShoppingListItem>;
  deleteItem(id: string): Promise<void>;
  findItemsByListId(listId: string): Promise<ShoppingListItem[]>;
  getFrequentItems(userId: string, limit: number): Promise<FrequentItem[]>;
  searchItems(
    userId: string,
    searchTerm: string,
    limit: number
  ): Promise<FrequentItem[]>;
}
