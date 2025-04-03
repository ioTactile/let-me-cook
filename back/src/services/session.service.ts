import { Request } from "express";
import { AppError } from "@/middleware/error.middleware";

export class SessionService {
  static async createSession(req: Request, userId: string): Promise<void> {
    if (!req.session) {
      throw new AppError("Session non initialisée", 500);
    }

    req.session.userId = userId;
    req.session.createdAt = new Date();
    req.session.lastActivity = new Date();
  }

  static async updateLastActivity(req: Request): Promise<void> {
    if (!req.session) {
      throw new AppError("Session non initialisée", 500);
    }

    req.session.lastActivity = new Date();
  }

  static async destroySession(req: Request): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!req.session) {
        reject(new AppError("Session non initialisée", 500));
        return;
      }

      req.session.destroy((err) => {
        if (err) {
          reject(
            new AppError("Erreur lors de la destruction de la session", 500)
          );
          return;
        }
        resolve();
      });
    });
  }

  static async validateSession(req: Request): Promise<boolean> {
    if (!req.session?.userId) {
      return false;
    }

    const lastActivity = req.session.lastActivity;
    if (!lastActivity) {
      return false;
    }

    // Vérifier si la session n'a pas expiré (24h)
    const sessionAge = Date.now() - lastActivity.getTime();
    return sessionAge < 24 * 60 * 60 * 1000;
  }
}
