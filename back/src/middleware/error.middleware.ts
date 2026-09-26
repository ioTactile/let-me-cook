import { Request, Response, NextFunction } from "express";
import { AppError } from "@/domain/errors/app-error";

export { AppError };

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }
  res.status(500).json({ message: "Erreur serveur interne" });
};
