import { Request } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { AppError } from "@/middleware/error.middleware";
import { SessionService } from "@/services/session.service";

const prisma = new PrismaClient();

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET!;
  private static readonly JWT_EXPIRES_IN = "7d";

  static async register(
    userData: {
      email: string;
      password: string;
      username: string;
    },
    req: Request
  ) {
    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        throw new AppError("Un utilisateur avec cet email existe déjà", 400);
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Créer l'utilisateur
      const user = await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
        },
      });

      // Générer le token JWT
      const token = this.generateToken(user.id);
      await SessionService.createSession(req, user.id);

      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
        token,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Erreur lors de l'inscription", 500);
    }
  }

  static async login(
    credentials: { email: string; password: string },
    req: Request
  ) {
    try {
      // Trouver l'utilisateur
      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
      });

      if (!user) {
        throw new AppError("Email ou mot de passe incorrect", 401);
      }

      // Vérifier le mot de passe
      const isPasswordValid = await bcrypt.compare(
        credentials.password,
        user.password
      );

      if (!isPasswordValid) {
        throw new AppError("Email ou mot de passe incorrect", 401);
      }

      // Générer le token JWT
      const token = this.generateToken(user.id);
      await SessionService.createSession(req, user.id);

      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
        token,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Erreur lors de la connexion", 500);
    }
  }

  static async logout(req: Request): Promise<void> {
    try {
      await SessionService.destroySession(req);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Erreur lors de la déconnexion", 500);
    }
  }

  private static generateToken(userId: string): string {
    return jwt.sign({ userId }, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    });
  }

  static async getCurrentUser(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new AppError("Utilisateur non trouvé", 404);
      }

      return user;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        "Erreur lors de la récupération de l'utilisateur",
        500
      );
    }
  }
}
