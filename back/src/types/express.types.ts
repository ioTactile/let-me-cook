import type { Request } from 'express';

declare global {
  // Augmentation Express Request — namespace requis par @types/express
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user: {
        id: string;
      };
    }
  }
}

export type AuthenticatedRequest = Request;
