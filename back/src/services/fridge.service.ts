import { PrismaClient } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { AppError } from "@/middleware/error.middleware";
import { OpenAIService } from "@/services/openai.service";
import {
  FridgeItem,
  CreateFridgeItemDto,
  UpdateFridgeItemDto,
} from "@/types/fridge.types";

const prisma = new PrismaClient();

export class FridgeService {
  // Valide les dates
  private static validateDates(expirationDate: Date | null): boolean {
    if (expirationDate === null) return true;
    return expirationDate instanceof Date && !isNaN(expirationDate.getTime());
  }

  // Valide la quantité
  private static validateQuantity(quantity: number): boolean {
    return typeof quantity === "number" && quantity > 0;
  }

  // Valide les données de l'ingrédient
  private static validateItemData(
    data: CreateFridgeItemDto | UpdateFridgeItemDto
  ): void {
    if (data.ingredientName !== undefined && !data.ingredientName.trim()) {
      throw new AppError("Le nom de l'ingrédient est requis", 400);
    }
    if (data.quantity !== undefined && !this.validateQuantity(data.quantity)) {
      throw new AppError("La quantité doit être positive", 400);
    }
    if (data.unit !== undefined && !data.unit.trim()) {
      throw new AppError("L'unité est requise", 400);
    }
    if (
      data.expirationDate !== undefined &&
      !this.validateDates(data.expirationDate)
    ) {
      throw new AppError("La date d'expiration est invalide", 400);
    }
  }

  // Convertit les données en un ingrédient du frigo
  private static toPrismaFridgeItem(
    data: CreateFridgeItemDto
  ): Prisma.FridgeItemCreateInput {
    this.validateItemData(data);
    return {
      user: {
        connect: { id: data.userId },
      },
      ingredientName: data.ingredientName,
      quantity: data.quantity,
      unit: data.unit,
      expirationDate: data.expirationDate,
      metadata: data.metadata as Prisma.InputJsonValue,
    };
  }

  // Convertit les données en un ingrédient du frigo
  private static toPrismaUpdate(
    data: UpdateFridgeItemDto
  ): Prisma.FridgeItemUpdateInput {
    if (
      data.ingredientName ||
      data.quantity ||
      data.unit ||
      data.expirationDate
    ) {
      this.validateItemData(data);
    }
    return {
      ingredientName: data.ingredientName,
      quantity: data.quantity,
      unit: data.unit,
      expirationDate: data.expirationDate,
      metadata: data.metadata as Prisma.InputJsonValue,
    };
  }

  private static toFridgeItem(
    prismaItem: Prisma.FridgeItemGetPayload<{}>
  ): FridgeItem {
    return {
      id: prismaItem.id,
      userId: prismaItem.userId,
      ingredientName: prismaItem.ingredientName,
      quantity: prismaItem.quantity,
      unit: prismaItem.unit,
      expirationDate: prismaItem.expirationDate,
      metadata: prismaItem.metadata as unknown as FridgeItem["metadata"],
      createdAt: prismaItem.createdAt,
      updatedAt: prismaItem.updatedAt,
    };
  }

  // Analyse l'ingrédient et crée un nouvel ingrédient dans le frigo
  static async createFridgeItem(
    itemData: CreateFridgeItemDto
  ): Promise<FridgeItem> {
    try {
      const analysis = await OpenAIService.analyzeIngredient(
        itemData.ingredientName
      );

      const metadata = {
        ...itemData.metadata,
        analysis,
      };

      const prismaItem = await prisma.$transaction(async (tx) => {
        return await tx.fridgeItem.create({
          data: {
            ...this.toPrismaFridgeItem(itemData),
            metadata,
          },
        });
      });

      return this.toFridgeItem(prismaItem);
    } catch (error) {
      console.log("error create fridge item", error);
      if (error instanceof AppError) throw error;
      throw new AppError("Erreur lors de la création de l'ingrédient", 500);
    }
  }

  // Récupère tous les ingrédients du frigo
  static async getFridgeItems(userId: string): Promise<FridgeItem[]> {
    try {
      const prismaItems = await prisma.fridgeItem.findMany({
        where: { userId },
        orderBy: { expirationDate: "asc" },
      });

      return prismaItems.map((item) => this.toFridgeItem(item));
    } catch (error) {
      throw new AppError("Erreur lors de la récupération des ingrédients", 500);
    }
  }

  // Récupère un ingrédient du frigo par son id
  static async getFridgeItemById(id: string): Promise<FridgeItem> {
    const prismaItem = await prisma.fridgeItem.findUnique({
      where: { id },
    });

    if (!prismaItem) {
      throw new AppError("Ingrédient non trouvé", 404);
    }

    return this.toFridgeItem(prismaItem);
  }

  // Met à jour un ingrédient du frigo
  static async updateFridgeItem(
    id: string,
    itemData: UpdateFridgeItemDto
  ): Promise<FridgeItem> {
    try {
      const prismaItem = await prisma.$transaction(async (tx) => {
        return await tx.fridgeItem.update({
          where: { id },
          data: this.toPrismaUpdate(itemData),
        });
      });

      return this.toFridgeItem(prismaItem);
    } catch (error) {
      console.log("error update fridge item", error);
      throw new AppError("Erreur lors de la mise à jour de l'ingrédient", 500);
    }
  }

  // Supprime un ingrédient du frigo
  static async deleteFridgeItem(id: string): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.fridgeItem.delete({
          where: { id },
        });
      });
    } catch (error) {
      console.log("error delete fridge item", error);
      throw new AppError("Erreur lors de la suppression de l'ingrédient", 500);
    }
  }

  // Récupère les ingrédients périmés
  static async getExpiringItems(userId: string, daysThreshold: number = 7) {
    try {
      if (daysThreshold <= 0) {
        throw new AppError("Le seuil de jours doit être positif", 400);
      }

      const items = await prisma.fridgeItem.findMany({
        where: {
          userId,
          expirationDate: {
            lte: new Date(Date.now() + daysThreshold * 24 * 60 * 60 * 1000),
            gte: new Date(),
          },
        },
        orderBy: {
          expirationDate: "asc",
        },
      });
      return items.map((item) => this.toFridgeItem(item));
    } catch (error) {
      console.log("error get expiring items", error);
      if (error instanceof AppError) throw error;
      throw new AppError(
        "Erreur lors de la récupération des ingrédients périmés",
        500
      );
    }
  }
}
