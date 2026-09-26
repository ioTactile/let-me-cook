import {
  FridgeItem,
  CreateFridgeItemDto,
  UpdateFridgeItemDto,
} from "@/types/fridge.types";

export interface FridgeRepository {
  create(data: CreateFridgeItemDto & { metadata?: unknown }): Promise<FridgeItem>;
  findAllByUser(userId: string): Promise<FridgeItem[]>;
  findById(id: string): Promise<FridgeItem | null>;
  update(id: string, data: UpdateFridgeItemDto): Promise<FridgeItem>;
  delete(id: string): Promise<void>;
  findExpiring(userId: string, daysThreshold: number): Promise<FridgeItem[]>;
}
