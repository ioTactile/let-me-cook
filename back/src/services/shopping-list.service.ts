import { PrismaClient } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { AppError } from "@/middleware/error.middleware";
import { OpenAIService } from "@/services/openai.service";
import {
  ShoppingList,
  CreateShoppingListDto,
  UpdateShoppingListDto,
  ShoppingListItem,
  CreateShoppingListItemDto,
  UpdateShoppingListItemDto,
} from "@/types/shopping-list.types";
import { ShoppingListStatus, ShoppingListItemStatus } from "@prisma/client";

const prisma = new PrismaClient();

export class ShoppingListService {
  private static validateListData(
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

  private static validateListItemData(
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

  // private static toPrismaShoppingList(
  //   data: CreateShoppingListDto
  // ): Prisma.ShoppingListCreateInput {
  //   this.validateListData(data);
  //   return {
  //     user: {
  //       connect: { id: data.userId },
  //     },
  //     name: data.name,
  //     items: {
  //       create: data.items.map((item) => ({
  //         ingredientName: item.ingredientName,
  //         quantity: item.quantity,
  //         unit: item.unit,
  //         status: item.status,
  //       })),
  //     },
  //     status: data.status || "pending",
  //     metadata: data.metadata as Prisma.InputJsonValue,
  //   };
  // }

  private static toPrismaUpdate(
    data: UpdateShoppingListDto
  ): Prisma.ShoppingListUpdateInput {
    if (data.name || data.status || data.items) {
      this.validateListData(data);
    }
    return {
      name: data.name,
      status: data.status,
      metadata: data.metadata as Prisma.InputJsonValue,
    };
  }

  private static toPrismaListItem(
    data: CreateShoppingListItemDto
  ): Prisma.ShoppingListItemCreateInput {
    this.validateListItemData(data);
    return {
      shoppingList: {
        connect: { id: data.shoppingListId },
      },
      ingredientName: data.ingredientName,
      quantity: data.quantity,
      unit: data.unit,
      status: data.status || "pending",
      imageUrl: data.imageUrl,
    };
  }

  private static toPrismaListItemUpdate(
    data: UpdateShoppingListItemDto
  ): Prisma.ShoppingListItemUpdateInput {
    if (
      data.ingredientName ||
      data.quantity ||
      data.unit ||
      data.status ||
      data.imageUrl
    ) {
      this.validateListItemData(data);
    }
    return {
      ingredientName: data.ingredientName,
      quantity: data.quantity,
      unit: data.unit,
      status: data.status,
      imageUrl: data.imageUrl,
    };
  }

  private static toShoppingList(prismaList: any): ShoppingList {
    return {
      id: prismaList.id,
      userId: prismaList.userId,
      name: prismaList.name,
      status: prismaList.status,
      metadata: prismaList.metadata as unknown as ShoppingList["metadata"],
      items:
        prismaList.items?.map((item: any) => this.toShoppingListItem(item)) ||
        [],
      createdAt: prismaList.createdAt,
      updatedAt: prismaList.updatedAt,
    };
  }

  private static toShoppingListItem(prismaItem: any): ShoppingListItem {
    return {
      id: prismaItem.id,
      shoppingListId: prismaItem.shoppingListId,
      ingredientName: prismaItem.ingredientName,
      quantity: prismaItem.quantity,
      unit: prismaItem.unit,
      status: prismaItem.status,
      createdAt: prismaItem.createdAt,
      updatedAt: prismaItem.updatedAt,
      imageUrl: prismaItem.imageUrl,
    };
  }

  static async createShoppingList(
    listData: CreateShoppingListDto
  ): Promise<ShoppingList> {
    try {
      // Générer toutes les images en parallèle
      const itemsWithImages = await Promise.all(
        listData.items.map(async (item) => {
          const imageUrl = await OpenAIService.generateIngredientImageUrl(
            item.ingredientName
          );
          return {
            ...item,
            imageUrl,
          };
        })
      );

      const prismaList = await prisma.$transaction(async (tx) => {
        // Créer la liste
        const list = await tx.shoppingList.create({
          data: {
            user: {
              connect: { id: listData.userId },
            },
            name: listData.name,
            status: listData.status || "pending",
            metadata: listData.metadata as Prisma.InputJsonValue,
          },
        });

        // Créer tous les items en une seule fois
        await tx.shoppingListItem.createMany({
          data: itemsWithImages.map((item) => ({
            shoppingListId: list.id,
            ingredientName: item.ingredientName,
            quantity: item.quantity,
            unit: item.unit,
            status: item.status || "pending",
            imageUrl: item.imageUrl,
          })),
        });

        // Récupérer la liste complète avec ses items
        return await tx.shoppingList.findUnique({
          where: { id: list.id },
          include: {
            items: true,
          },
        });
      });

      return this.toShoppingList(prismaList);
    } catch (error) {
      console.log("error create shopping list", error);
      if (error instanceof AppError) throw error;
      throw new AppError(
        "Erreur lors de la création de la liste de courses",
        500
      );
    }
  }

  static async getShoppingLists(userId: string): Promise<ShoppingList[]> {
    try {
      const prismaLists = await prisma.shoppingList.findMany({
        where: { userId },
        include: {
          items: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return prismaLists.map((list) => this.toShoppingList(list));
    } catch (error) {
      throw new AppError(
        "Erreur lors de la récupération des listes de courses",
        500
      );
    }
  }

  static async getShoppingListById(id: string): Promise<ShoppingList> {
    const prismaList = await prisma.shoppingList.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!prismaList) {
      throw new AppError("Liste de courses non trouvée", 404);
    }

    return this.toShoppingList(prismaList);
  }

  static async updateShoppingList(
    id: string,
    listData: UpdateShoppingListDto
  ): Promise<ShoppingList> {
    try {
      const prismaList = await prisma.$transaction(async (tx) => {
        return await tx.shoppingList.update({
          where: { id },
          data: this.toPrismaUpdate(listData),
          include: {
            items: true,
          },
        });
      });

      return this.toShoppingList(prismaList);
    } catch (error) {
      console.log("error update shopping list", error);
      if (error instanceof AppError) throw error;
      throw new AppError(
        "Erreur lors de la mise à jour de la liste de courses",
        500
      );
    }
  }

  static async deleteShoppingList(id: string): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        // Supprimer d'abord tous les items
        await tx.shoppingListItem.deleteMany({
          where: { shoppingListId: id },
        });
        // Puis supprimer la liste
        await tx.shoppingList.delete({
          where: { id },
        });
      });
    } catch (error) {
      console.log("error delete shopping list", error);
      throw new AppError(
        "Erreur lors de la suppression de la liste de courses",
        500
      );
    }
  }

  static async addShoppingListItem(
    itemData: CreateShoppingListItemDto
  ): Promise<ShoppingListItem> {
    try {
      const imageUrl = await OpenAIService.generateIngredientImageUrl(
        itemData.ingredientName
      );

      const prismaItem = await prisma.$transaction(async (tx) => {
        return await tx.shoppingListItem.create({
          data: this.toPrismaListItem({
            ...itemData,
            imageUrl,
          }),
        });
      });

      return this.toShoppingListItem(prismaItem);
    } catch (error) {
      console.log("error add shopping list item", error);
      if (error instanceof AppError) throw error;
      throw new AppError("Erreur lors de l'ajout de l'élément à la liste", 500);
    }
  }

  static async updateShoppingListItem(
    id: string,
    itemData: UpdateShoppingListItemDto
  ): Promise<ShoppingListItem> {
    try {
      if (!itemData.ingredientName) {
        throw new AppError("Le nom de l'ingrédient est requis", 400);
      }

      if (itemData.imageUrl) {
        itemData.imageUrl = await OpenAIService.generateIngredientImageUrl(
          itemData.ingredientName
        );
      }

      const previousItem = await prisma.shoppingListItem.findUnique({
        where: { id },
      });

      if (previousItem?.ingredientName !== itemData.ingredientName) {
        itemData.imageUrl = await OpenAIService.generateIngredientImageUrl(
          itemData.ingredientName
        );
      }

      const prismaItem = await prisma.$transaction(async (tx) => {
        return await tx.shoppingListItem.update({
          where: { id },
          data: this.toPrismaListItemUpdate(itemData),
        });
      });

      return this.toShoppingListItem(prismaItem);
    } catch (error) {
      console.log("error update shopping list item", error);
      if (error instanceof AppError) throw error;
      throw new AppError("Erreur lors de la mise à jour de l'élément", 500);
    }
  }

  static async deleteShoppingListItem(id: string): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.shoppingListItem.delete({
          where: { id },
        });
      });
    } catch (error) {
      console.log("error delete shopping list item", error);
      throw new AppError("Erreur lors de la suppression de l'élément", 500);
    }
  }

  static async generateOptimizedList(listId: string): Promise<ShoppingList> {
    try {
      const list = await this.getShoppingListById(listId);
      const items = await prisma.shoppingListItem.findMany({
        where: { shoppingListId: listId },
      });

      if (!items.length) {
        throw new AppError("La liste est vide", 400);
      }

      const optimizedList = await OpenAIService.generateShoppingList(
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

  static async getFrequentItems(
    userId: string,
    limit: number = 10
  ): Promise<
    { ingredientName: string; count: number; imageUrl: string | null }[]
  > {
    try {
      const frequentItems = await prisma.shoppingListItem.groupBy({
        by: ["ingredientName"],
        where: {
          shoppingList: {
            userId: userId,
          },
        },
        _count: {
          ingredientName: true,
        },
        orderBy: {
          _count: {
            ingredientName: "desc",
          },
        },
        take: limit,
      });

      const itemsWithImages = await Promise.all(
        frequentItems.map(async (item) => {
          const lastItem = await prisma.shoppingListItem.findFirst({
            where: {
              AND: [
                {
                  ingredientName: item.ingredientName,
                },
                {
                  shoppingList: {
                    userId: userId,
                  },
                },
              ],
            },
            orderBy: {
              createdAt: "desc",
            },
            select: {
              imageUrl: true,
            },
          });

          return {
            ingredientName: item.ingredientName,
            count: item._count.ingredientName,
            imageUrl: lastItem?.imageUrl || null,
          };
        })
      );

      return itemsWithImages;
    } catch (error) {
      console.log("error getting frequent items", error);
      throw new AppError(
        "Erreur lors de la récupération des items fréquents",
        500
      );
    }
  }

  static async searchItems(
    userId: string,
    searchTerm: string,
    limit: number = 10
  ): Promise<
    { ingredientName: string; count: number; imageUrl: string | null }[]
  > {
    try {
      const frequentItems = await prisma.shoppingListItem.groupBy({
        by: ["ingredientName"],
        where: {
          AND: [
            {
              shoppingList: {
                userId: userId,
              },
            },
            {
              ingredientName: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
          ],
        },
        _count: {
          ingredientName: true,
        },
        orderBy: {
          _count: {
            ingredientName: "desc",
          },
        },
        take: limit,
      });

      const itemsWithImages = await Promise.all(
        frequentItems.map(async (item) => {
          const lastItem = await prisma.shoppingListItem.findFirst({
            where: {
              AND: [
                {
                  ingredientName: item.ingredientName,
                },
                {
                  shoppingList: {
                    userId: userId,
                  },
                },
              ],
            },
            orderBy: {
              createdAt: "desc",
            },
            select: {
              imageUrl: true,
            },
          });

          return {
            ingredientName: item.ingredientName,
            count: item._count.ingredientName,
            imageUrl: lastItem?.imageUrl || null,
          };
        })
      );

      return itemsWithImages;
    } catch (error) {
      console.log("error searching items", error);
      throw new AppError("Erreur lors de la recherche des items", 500);
    }
  }
}
