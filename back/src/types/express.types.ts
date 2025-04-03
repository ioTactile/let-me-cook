import type { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
      };
    }
  }
}

export type AuthenticatedRequest = Request;
