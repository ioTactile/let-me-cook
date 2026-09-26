import { AppError } from "@/domain/errors/app-error";
import { SessionPort } from "@/application/ports/session.port";

type ExpressSessionLike = {
  userId?: string;
  createdAt?: Date;
  lastActivity?: Date;
  destroy(callback: (err?: Error) => void): void;
};

export class ExpressSessionAdapter implements SessionPort {
  constructor(private readonly session: ExpressSessionLike) {}

  async create(userId: string): Promise<void> {
    if (!this.session) {
      throw new AppError("Session non initialisée", 500);
    }
    this.session.userId = userId;
    this.session.createdAt = new Date();
    this.session.lastActivity = new Date();
  }

  async updateLastActivity(): Promise<void> {
    if (!this.session) {
      throw new AppError("Session non initialisée", 500);
    }
    this.session.lastActivity = new Date();
  }

  async destroy(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.session) {
        reject(new AppError("Session non initialisée", 500));
        return;
      }
      this.session.destroy((err) => {
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

  async validate(): Promise<boolean> {
    if (!this.session?.userId || !this.session.lastActivity) {
      return false;
    }
    const sessionAge = Date.now() - this.session.lastActivity.getTime();
    return sessionAge < 24 * 60 * 60 * 1000;
  }
}
