import type { Prisma } from "@/generated/prisma/client";
import {
  ShoppingListStatus as PrismaShoppingListStatus,
  ShoppingListItemStatus as PrismaShoppingListItemStatus,
  Unit as PrismaUnit,
} from "@/generated/prisma/client";
import {
  FrequentItem,
  ShoppingListRepository,
} from "@/application/ports/shopping-list.repository";
import { prisma } from "@/infrastructure/prisma/client";
import {
  ShoppingList,
  ShoppingListItem,
  CreateShoppingListDto,
  UpdateShoppingListDto,
  CreateShoppingListItemDto,
  UpdateShoppingListItemDto,
} from "@/types/shopping-list.types";

export class PrismaShoppingListRepository implements ShoppingListRepository {
  private toShoppingListItem(prismaItem: any): ShoppingListItem {
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

  private toShoppingList(prismaList: any): ShoppingList {
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

  async create(
    data: CreateShoppingListDto,
    itemsWithImages: Array<
      CreateShoppingListItemDto & { imageUrl: string; status?: string }
    >
  ): Promise<ShoppingList> {
    const prismaList = await prisma.$transaction(async (tx) => {
      const list = await tx.shoppingList.create({
        data: {
          user: { connect: { id: data.userId } },
          name: data.name,
          status: (data.status ||
            "pending") as PrismaShoppingListStatus,
          metadata: data.metadata as Prisma.InputJsonValue,
        },
      });

      await tx.shoppingListItem.createMany({
        data: itemsWithImages.map((item) => ({
          shoppingListId: list.id,
          ingredientName: item.ingredientName,
          quantity: item.quantity,
          unit: item.unit as PrismaUnit,
          status: (item.status ||
            "pending") as PrismaShoppingListItemStatus,
          imageUrl: item.imageUrl,
        })),
      });

      return await tx.shoppingList.findUnique({
        where: { id: list.id },
        include: { items: true },
      });
    });

    return this.toShoppingList(prismaList);
  }

  async findAllByUser(userId: string): Promise<ShoppingList[]> {
    const prismaLists = await prisma.shoppingList.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    return prismaLists.map((list) => this.toShoppingList(list));
  }

  async findById(id: string): Promise<ShoppingList | null> {
    const prismaList = await prisma.shoppingList.findUnique({
      where: { id },
      include: { items: true },
    });
    return prismaList ? this.toShoppingList(prismaList) : null;
  }

  async update(
    id: string,
    data: UpdateShoppingListDto
  ): Promise<ShoppingList> {
    const prismaList = await prisma.shoppingList.update({
      where: { id },
      data: {
        name: data.name,
        status: data.status as PrismaShoppingListStatus | undefined,
        metadata: data.metadata as Prisma.InputJsonValue,
      },
      include: { items: true },
    });
    return this.toShoppingList(prismaList);
  }

  async delete(id: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.shoppingListItem.deleteMany({
        where: { shoppingListId: id },
      });
      await tx.shoppingList.delete({ where: { id } });
    });
  }

  async addItem(
    data: CreateShoppingListItemDto & { imageUrl: string }
  ): Promise<ShoppingListItem> {
    const prismaItem = await prisma.shoppingListItem.create({
      data: {
        shoppingList: { connect: { id: data.shoppingListId } },
        ingredientName: data.ingredientName,
        quantity: data.quantity,
        unit: data.unit as PrismaUnit,
        status: (data.status ||
          "pending") as PrismaShoppingListItemStatus,
        imageUrl: data.imageUrl,
      },
    });
    return this.toShoppingListItem(prismaItem);
  }

  async findItemById(id: string): Promise<ShoppingListItem | null> {
    const prismaItem = await prisma.shoppingListItem.findUnique({
      where: { id },
    });
    return prismaItem ? this.toShoppingListItem(prismaItem) : null;
  }

  async updateItem(
    id: string,
    data: UpdateShoppingListItemDto
  ): Promise<ShoppingListItem> {
    const prismaItem = await prisma.shoppingListItem.update({
      where: { id },
      data: {
        ingredientName: data.ingredientName,
        quantity: data.quantity,
        unit: data.unit as PrismaUnit | undefined,
        status: data.status as PrismaShoppingListItemStatus | undefined,
        imageUrl: data.imageUrl,
      },
    });
    return this.toShoppingListItem(prismaItem);
  }

  async deleteItem(id: string): Promise<void> {
    await prisma.shoppingListItem.delete({ where: { id } });
  }

  async findItemsByListId(listId: string): Promise<ShoppingListItem[]> {
    const items = await prisma.shoppingListItem.findMany({
      where: { shoppingListId: listId },
    });
    return items.map((item) => this.toShoppingListItem(item));
  }

  async getFrequentItems(
    userId: string,
    limit: number
  ): Promise<FrequentItem[]> {
    const frequentItems = await prisma.shoppingListItem.groupBy({
      by: ["ingredientName"],
      where: {
        shoppingList: { userId },
      },
      _count: { ingredientName: true },
      orderBy: { _count: { ingredientName: "desc" } },
      take: limit,
    });

    return Promise.all(
      frequentItems.map(async (item) => {
        const lastItem = await prisma.shoppingListItem.findFirst({
          where: {
            AND: [
              { ingredientName: item.ingredientName },
              { shoppingList: { userId } },
            ],
          },
          orderBy: { createdAt: "desc" },
          select: { imageUrl: true },
        });

        return {
          ingredientName: item.ingredientName,
          count: item._count.ingredientName,
          imageUrl: lastItem?.imageUrl || null,
        };
      })
    );
  }

  async searchItems(
    userId: string,
    searchTerm: string,
    limit: number
  ): Promise<FrequentItem[]> {
    const frequentItems = await prisma.shoppingListItem.groupBy({
      by: ["ingredientName"],
      where: {
        AND: [
          { shoppingList: { userId } },
          {
            ingredientName: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        ],
      },
      _count: { ingredientName: true },
      orderBy: { _count: { ingredientName: "desc" } },
      take: limit,
    });

    return Promise.all(
      frequentItems.map(async (item) => {
        const lastItem = await prisma.shoppingListItem.findFirst({
          where: {
            AND: [
              { ingredientName: item.ingredientName },
              { shoppingList: { userId } },
            ],
          },
          orderBy: { createdAt: "desc" },
          select: { imageUrl: true },
        });

        return {
          ingredientName: item.ingredientName,
          count: item._count.ingredientName,
          imageUrl: lastItem?.imageUrl || null,
        };
      })
    );
  }
}
