import type { Prisma } from '@/generated/prisma/client';
import { ApplianceRepository } from '@/application/ports/appliance.repository';
import { prisma } from '@/infrastructure/prisma/client';
import { Appliance, CreateApplianceDto, UpdateApplianceDto } from '@/types/appliance.types';

export class PrismaApplianceRepository implements ApplianceRepository {
  private toAppliance(prismaAppliance: Prisma.ApplianceGetPayload<object>): Appliance {
    return {
      id: prismaAppliance.id,
      userId: prismaAppliance.userId,
      name: prismaAppliance.name,
      description: prismaAppliance.description,
      createdAt: prismaAppliance.createdAt,
      updatedAt: prismaAppliance.updatedAt,
    };
  }

  async create(data: CreateApplianceDto): Promise<Appliance> {
    const prismaAppliance = await prisma.appliance.create({
      data: {
        user: { connect: { id: data.userId } },
        name: data.name,
        description: data.description,
      },
    });
    return this.toAppliance(prismaAppliance);
  }

  async findAllByUser(userId: string): Promise<Appliance[]> {
    const prismaAppliances = await prisma.appliance.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
    return prismaAppliances.map((a) => this.toAppliance(a));
  }

  async findById(id: string): Promise<Appliance | null> {
    const prismaAppliance = await prisma.appliance.findUnique({
      where: { id },
    });
    return prismaAppliance ? this.toAppliance(prismaAppliance) : null;
  }

  async update(id: string, data: UpdateApplianceDto): Promise<Appliance> {
    const prismaAppliance = await prisma.appliance.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
      },
    });
    return this.toAppliance(prismaAppliance);
  }

  async delete(id: string): Promise<void> {
    await prisma.appliance.delete({ where: { id } });
  }
}
