import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "@/domain/errors/app-error";
import { userRepository } from "@/infrastructure/container";
import { AuthenticatedRequest } from "@/types/express.types";

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

    const exists = await userRepository.existsById(decoded.userId);

    if (!exists) {
      throw new AppError("Utilisateur non trouvé", 401);
    }

    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    console.log("error auth middleware", error);
    next(new AppError("Token invalide", 401));
  }
};
