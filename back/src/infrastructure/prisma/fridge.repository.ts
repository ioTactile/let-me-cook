import type { Prisma } from "@/generated/prisma/client";
import { FridgeRepository } from "@/application/ports/fridge.repository";
import { prisma } from "@/infrastructure/prisma/client";
import {
  FridgeItem,
  CreateFridgeItemDto,
  UpdateFridgeItemDto,
} from "@/types/fridge.types";

export class PrismaFridgeRepository implements FridgeRepository {
  private toFridgeItem(
    prismaItem: Prisma.FridgeItemGetPayload<object>
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

  async create(
    data: CreateFridgeItemDto & { metadata?: unknown }
  ): Promise<FridgeItem> {
    const prismaItem = await prisma.fridgeItem.create({
      data: {
        user: { connect: { id: data.userId } },
        ingredientName: data.ingredientName,
        quantity: data.quantity,
        unit: data.unit,
        expirationDate: data.expirationDate,
        metadata: data.metadata as Prisma.InputJsonValue,
      },
    });
    return this.toFridgeItem(prismaItem);
  }

  async findAllByUser(userId: string): Promise<FridgeItem[]> {
    const prismaItems = await prisma.fridgeItem.findMany({
      where: { userId },
      orderBy: { expirationDate: "asc" },
    });
    return prismaItems.map((item) => this.toFridgeItem(item));
  }

  async findById(id: string): Promise<FridgeItem | null> {
    const prismaItem = await prisma.fridgeItem.findUnique({ where: { id } });
    return prismaItem ? this.toFridgeItem(prismaItem) : null;
  }

  async update(id: string, data: UpdateFridgeItemDto): Promise<FridgeItem> {
    const prismaItem = await prisma.fridgeItem.update({
      where: { id },
      data: {
        ingredientName: data.ingredientName,
        quantity: data.quantity,
        unit: data.unit,
        expirationDate: data.expirationDate,
        metadata: data.metadata as Prisma.InputJsonValue,
      },
    });
    return this.toFridgeItem(prismaItem);
  }

  async delete(id: string): Promise<void> {
    await prisma.fridgeItem.delete({ where: { id } });
  }

  async findExpiring(
    userId: string,
    daysThreshold: number
  ): Promise<FridgeItem[]> {
    const items = await prisma.fridgeItem.findMany({
      where: {
        userId,
        expirationDate: {
          lte: new Date(Date.now() + daysThreshold * 24 * 60 * 60 * 1000),
          gte: new Date(),
        },
      },
      orderBy: { expirationDate: "asc" },
    });
    return items.map((item) => this.toFridgeItem(item));
  }
}
