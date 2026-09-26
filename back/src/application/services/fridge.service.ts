import { AiPort } from "@/application/ports/ai.port";
import { FridgeRepository } from "@/application/ports/fridge.repository";
import { AppError } from "@/domain/errors/app-error";
import {
  FridgeItem,
  CreateFridgeItemDto,
  UpdateFridgeItemDto,
} from "@/types/fridge.types";

export class FridgeService {
  constructor(
    private readonly fridgeRepository: FridgeRepository,
    private readonly ai: AiPort
  ) {}

  private validateDates(expirationDate: Date | null): boolean {
    if (expirationDate === null) return true;
    return expirationDate instanceof Date && !isNaN(expirationDate.getTime());
  }

  private validateQuantity(quantity: number): boolean {
    return typeof quantity === "number" && quantity > 0;
  }

  private validateItemData(
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

  async createFridgeItem(itemData: CreateFridgeItemDto): Promise<FridgeItem> {
    try {
      this.validateItemData(itemData);

      const analysis = await this.ai.analyzeIngredient(itemData.ingredientName);

      const metadata = {
        ...itemData.metadata,
        analysis,
      };

      return await this.fridgeRepository.create({
        ...itemData,
        metadata,
      });
    } catch (error) {
      console.log("error create fridge item", error);
      if (error instanceof AppError) throw error;
      throw new AppError("Erreur lors de la création de l'ingrédient", 500);
    }
  }

  async getFridgeItems(userId: string): Promise<FridgeItem[]> {
    try {
      return await this.fridgeRepository.findAllByUser(userId);
    } catch {
      throw new AppError("Erreur lors de la récupération des ingrédients", 500);
    }
  }

  async getFridgeItemById(id: string): Promise<FridgeItem> {
    const item = await this.fridgeRepository.findById(id);
    if (!item) {
      throw new AppError("Ingrédient non trouvé", 404);
    }
    return item;
  }

  async updateFridgeItem(
    id: string,
    itemData: UpdateFridgeItemDto
  ): Promise<FridgeItem> {
    try {
      if (
        itemData.ingredientName ||
        itemData.quantity ||
        itemData.unit ||
        itemData.expirationDate
      ) {
        this.validateItemData(itemData);
      }
      return await this.fridgeRepository.update(id, itemData);
    } catch (error) {
      console.log("error update fridge item", error);
      if (error instanceof AppError) throw error;
      throw new AppError("Erreur lors de la mise à jour de l'ingrédient", 500);
    }
  }

  async deleteFridgeItem(id: string): Promise<void> {
    try {
      await this.fridgeRepository.delete(id);
    } catch (error) {
      console.log("error delete fridge item", error);
      throw new AppError("Erreur lors de la suppression de l'ingrédient", 500);
    }
  }

  async getExpiringItems(userId: string, daysThreshold: number = 7) {
    try {
      if (daysThreshold <= 0) {
        throw new AppError("Le seuil de jours doit être positif", 400);
      }
      return await this.fridgeRepository.findExpiring(userId, daysThreshold);
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
