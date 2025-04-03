import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { AppError } from "@/middleware/error.middleware";
import { AuthenticatedRequest } from "@/types/express.types";

const prisma = new PrismaClient();

export const authMiddleware = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      throw new AppError("Token manquant", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true },
    });

    if (!user) {
      throw new AppError("Utilisateur non trouvé", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("error auth middleware", error);
    next(new AppError("Token invalide", 401));
  }
};
