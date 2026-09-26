import { AiPort } from "@/application/ports/ai.port";
import { ShoppingListRepository } from "@/application/ports/shopping-list.repository";
import {
  ShoppingListStatus,
  ShoppingListItemStatus,
} from "@/domain/enums";
import { AppError } from "@/domain/errors/app-error";
import {
  ShoppingList,
  CreateShoppingListDto,
  UpdateShoppingListDto,
  ShoppingListItem,
  CreateShoppingListItemDto,
  UpdateShoppingListItemDto,
} from "@/types/shopping-list.types";

export class ShoppingListService {
  constructor(
    private readonly shoppingListRepository: ShoppingListRepository,
    private readonly ai: AiPort
  ) {}

  private validateListData(
    data: CreateShoppingListDto | UpdateShoppingListDto
  ): void {
    if (data.name !== undefined && !data.name.trim()) {
      throw new AppError("Le nom de la liste est requis", 400);
    }
    if (
      data.status !== undefined &&
      !Object.values(ShoppingListStatus).includes(data.status)
    ) {
      throw new AppError(
        `Le statut doit être l'une des valeurs suivantes: ${Object.values(
          ShoppingListStatus
        ).join(", ")}`,
        400
      );
    }
    if (data.items !== undefined && !Array.isArray(data.items)) {
      throw new AppError("Les items doivent être un tableau", 400);
    }
  }

  private validateListItemData(
    data: CreateShoppingListItemDto | UpdateShoppingListItemDto
  ): void {
    if (data.ingredientName !== undefined && !data.ingredientName.trim()) {
      throw new AppError("Le nom de l'ingrédient est requis", 400);
    }
    if (
      data.quantity !== undefined &&
      (typeof data.quantity !== "number" || data.quantity <= 0)
    ) {
      throw new AppError("La quantité doit être positive", 400);
    }
    if (data.unit !== undefined && !data.unit.trim()) {
      throw new AppError("L'unité est requise", 400);
    }
    if (
      data.status !== undefined &&
      !Object.values(ShoppingListItemStatus).includes(data.status)
    ) {
      throw new AppError(
        `Le statut doit être l'une des valeurs suivantes: ${Object.values(
          ShoppingListItemStatus
        ).join(", ")}`,
        400
      );
    }
    if (data.imageUrl !== undefined && !data.imageUrl.trim()) {
      throw new AppError("L'URL de l'image est requise", 400);
    }
  }

  async createShoppingList(
    listData: CreateShoppingListDto
  ): Promise<ShoppingList> {
    try {
      this.validateListData(listData);

      const itemsWithImages = await Promise.all(
        listData.items.map(async (item) => {
          const imageUrl = await this.ai.generateIngredientImageUrl(
            item.ingredientName
          );
          return {
            ...item,
            imageUrl,
          };
        })
      );

      return await this.shoppingListRepository.create(
        listData,
        itemsWithImages
      );
    } catch (error) {
      console.log("error create shopping list", error);
      if (error instanceof AppError) throw error;
      throw new AppError(
        "Erreur lors de la création de la liste de courses",
        500
      );
    }
  }

  async getShoppingLists(userId: string): Promise<ShoppingList[]> {
    try {
      return await this.shoppingListRepository.findAllByUser(userId);
    } catch {
      throw new AppError(
        "Erreur lors de la récupération des listes de courses",
        500
      );
    }
  }

  async getShoppingListById(id: string): Promise<ShoppingList> {
    const list = await this.shoppingListRepository.findById(id);
    if (!list) {
      throw new AppError("Liste de courses non trouvée", 404);
    }
    return list;
  }

  async updateShoppingList(
    id: string,
    listData: UpdateShoppingListDto
  ): Promise<ShoppingList> {
    try {
      if (listData.name || listData.status || listData.items) {
        this.validateListData(listData);
      }
      return await this.shoppingListRepository.update(id, listData);
    } catch (error) {
      console.log("error update shopping list", error);
      if (error instanceof AppError) throw error;
      throw new AppError(
        "Erreur lors de la mise à jour de la liste de courses",
        500
      );
    }
  }

  async deleteShoppingList(id: string): Promise<void> {
    try {
      await this.shoppingListRepository.delete(id);
    } catch (error) {
      console.log("error delete shopping list", error);
      throw new AppError(
        "Erreur lors de la suppression de la liste de courses",
        500
      );
    }
  }

  async addShoppingListItem(
    itemData: CreateShoppingListItemDto
  ): Promise<ShoppingListItem> {
    try {
      this.validateListItemData(itemData);
      const imageUrl = await this.ai.generateIngredientImageUrl(
        itemData.ingredientName
      );
      return await this.shoppingListRepository.addItem({
        ...itemData,
        imageUrl,
      });
    } catch (error) {
      console.log("error add shopping list item", error);
      if (error instanceof AppError) throw error;
      throw new AppError("Erreur lors de l'ajout de l'élément à la liste", 500);
    }
  }

  async updateShoppingListItem(
    id: string,
    itemData: UpdateShoppingListItemDto
  ): Promise<ShoppingListItem> {
    try {
      if (!itemData.ingredientName) {
        throw new AppError("Le nom de l'ingrédient est requis", 400);
      }

      if (
        itemData.ingredientName ||
        itemData.quantity ||
        itemData.unit ||
        itemData.status ||
        itemData.imageUrl
      ) {
        this.validateListItemData(itemData);
      }

      if (itemData.imageUrl) {
        itemData.imageUrl = await this.ai.generateIngredientImageUrl(
          itemData.ingredientName
        );
      }

      const previousItem = await this.shoppingListRepository.findItemById(id);

      if (previousItem?.ingredientName !== itemData.ingredientName) {
        itemData.imageUrl = await this.ai.generateIngredientImageUrl(
          itemData.ingredientName
        );
      }

      return await this.shoppingListRepository.updateItem(id, itemData);
    } catch (error) {
      console.log("error update shopping list item", error);
      if (error instanceof AppError) throw error;
      throw new AppError("Erreur lors de la mise à jour de l'élément", 500);
    }
  }

  async deleteShoppingListItem(id: string): Promise<void> {
    try {
      await this.shoppingListRepository.deleteItem(id);
    } catch (error) {
      console.log("error delete shopping list item", error);
      throw new AppError("Erreur lors de la suppression de l'élément", 500);
    }
  }

  async generateOptimizedList(listId: string): Promise<ShoppingList> {
    try {
      const list = await this.getShoppingListById(listId);
      const items =
        await this.shoppingListRepository.findItemsByListId(listId);

      if (!items.length) {
        throw new AppError("La liste est vide", 400);
      }

      const optimizedList = await this.ai.generateShoppingList(
        JSON.stringify(
          items.map((item) => ({
            name: item.ingredientName,
            quantity: item.quantity,
            unit: item.unit,
          }))
        )
      );

      const metadata = {
        ...list.metadata,
        optimizedList,
      };

      return this.updateShoppingList(listId, { metadata });
    } catch (error) {
      console.log("error generate optimized list", error);
      if (error instanceof AppError) throw error;
      throw new AppError(
        "Erreur lors de la génération de la liste optimisée",
        500
      );
    }
  }

  async getFrequentItems(userId: string, limit: number = 10) {
    try {
      return await this.shoppingListRepository.getFrequentItems(userId, limit);
    } catch (error) {
      console.log("error getting frequent items", error);
      throw new AppError(
        "Erreur lors de la récupération des items fréquents",
        500
      );
    }
  }

  async searchItems(userId: string, searchTerm: string, limit: number = 10) {
    try {
      return await this.shoppingListRepository.searchItems(
        userId,
        searchTerm,
        limit
      );
    } catch (error) {
      console.log("error searching items", error);
      throw new AppError("Erreur lors de la recherche des items", 500);
    }
  }
}
