import { Request, Response, NextFunction } from "express";
import { cachePort } from "@/infrastructure/container";

export const cacheMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (req.method !== "GET") {
    next();
    return;
  }

  const key = `cache:${req.originalUrl || req.url}`;

  try {
    const cachedResponse = await cachePort.get(key);

    if (cachedResponse) {
      res.json(JSON.parse(cachedResponse));
      return;
    }

    const originalJson = res.json;
    res.json = (body: any): Response => {
      cachePort.set(key, JSON.stringify(body), 3600);
      return originalJson.call(res, body);
    };

    next();
  } catch (error) {
    console.error("Cache error:", error);
    next();
  }
};

export const invalidateCache = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const pattern = `cache:${req.baseUrl}*`;
    await cachePort.deleteByPattern(pattern);
    next();
  } catch (error) {
    console.error("Cache invalidation error:", error);
    next();
  }
};
