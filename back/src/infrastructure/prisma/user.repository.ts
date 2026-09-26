import {
  UserPublic,
  UserRecord,
  UserRepository,
} from "@/application/ports/user.repository";
import { prisma } from "@/infrastructure/prisma/client";

export class PrismaUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<UserRecord | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<UserPublic | null> {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      },
    });
  }

  async existsById(id: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });
    return user !== null;
  }

  async create(data: {
    email: string;
    password: string;
    username: string;
  }): Promise<UserRecord> {
    return prisma.user.create({ data });
  }
}
