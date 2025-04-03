import { PrismaClient } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { AppError } from "@/middleware/error.middleware";
import {
  Appliance,
  CreateApplianceDto,
  UpdateApplianceDto,
} from "@/types/appliance.types";

const prisma = new PrismaClient();

export class ApplianceService {
  // Convertit les données en un appareil
  private static toPrismaAppliance(
    data: CreateApplianceDto
  ): Prisma.ApplianceCreateInput {
    return {
      user: {
        connect: { id: data.userId },
      },
      name: data.name,
      description: data.description,
    };
  }

  // Convertit les données en un appareil
  private static toPrismaUpdate(
    data: UpdateApplianceDto
  ): Prisma.ApplianceUpdateInput {
    return {
      name: data.name,
      description: data.description,
    };
  }

  // Convertit les données en un appareil
  private static toAppliance(
    prismaAppliance: Prisma.ApplianceGetPayload<{}>
  ): Appliance {
    return {
      id: prismaAppliance.id,
      userId: prismaAppliance.userId,
      name: prismaAppliance.name,
      description: prismaAppliance.description,
      createdAt: prismaAppliance.createdAt,
      updatedAt: prismaAppliance.updatedAt,
    };
  }

  // Crée un appareil
  static async createAppliance(
    applianceData: CreateApplianceDto
  ): Promise<Appliance> {
    try {
      const prismaAppliance = await prisma.$transaction(async (tx) => {
        return await tx.appliance.create({
          data: this.toPrismaAppliance(applianceData),
        });
      });

      return this.toAppliance(prismaAppliance);
    } catch (error) {
      console.log("error create appliance", error);
      throw new AppError("Erreur lors de la création de l'appareil", 500);
    }
  }

  // Récupère tous les appareils
  static async getAppliances(userId: string): Promise<Appliance[]> {
    try {
      const prismaAppliances = await prisma.appliance.findMany({
        where: { userId },
        orderBy: { name: "asc" },
      });

      return prismaAppliances.map((appliance: Appliance) =>
        this.toAppliance(appliance)
      );
    } catch (error) {
      throw new AppError("Erreur lors de la récupération des appareils", 500);
    }
  }

  // Récupère un appareil par son id
  static async getApplianceById(id: string): Promise<Appliance> {
    const prismaAppliance = await prisma.appliance.findUnique({
      where: { id },
    });

    if (!prismaAppliance) {
      throw new AppError("Appareil non trouvé", 404);
    }

    return this.toAppliance(prismaAppliance);
  }

  // Met à jour un appareil
  static async updateAppliance(
    id: string,
    applianceData: UpdateApplianceDto
  ): Promise<Appliance> {
    try {
      const prismaAppliance = await prisma.appliance.update({
        where: {
          id,
        },
        data: this.toPrismaUpdate(applianceData),
      });

      return this.toAppliance(prismaAppliance);
    } catch (error) {
      console.log("error update appliance", error);
      if (error instanceof AppError) throw error;
      throw new AppError("Erreur lors de la mise à jour de l'appareil", 500);
    }
  }

  // Supprime un appareil
  static async deleteAppliance(id: string): Promise<void> {
    try {
      await prisma.appliance.delete({
        where: { id },
      });
    } catch (error) {
      console.log("error delete appliance", error);
      throw new AppError("Erreur lors de la suppression de l'appareil", 500);
    }
  }
}
