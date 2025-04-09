import { Request, Response, NextFunction } from "express";
import { redisClient } from "@/index";

export const cacheMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Ne pas mettre en cache les requêtes POST, PUT, DELETE
  if (req.method !== "GET") {
    next();
    return;
  }

  const key = `cache:${req.originalUrl || req.url}`;

  try {
    // Vérifier si la réponse est en cache
    const cachedResponse = await redisClient.get(key);

    if (cachedResponse) {
      res.json(JSON.parse(cachedResponse));
      return;
    }

    // Intercepter la réponse pour la mettre en cache
    const originalJson = res.json;
    res.json = (body: any): Response => {
      // Mettre en cache la réponse
      redisClient.setEx(key, 3600, JSON.stringify(body));
      return originalJson.call(res, body);
    };

    next();
  } catch (error) {
    console.error("Cache error:", error);
    next();
  }
};

// Middleware pour invalider le cache
export const invalidateCache = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    // Invalider le cache pour toutes les clés correspondant au pattern
    const pattern = `cache:${req.baseUrl}*`;
    const keys = await redisClient.keys(pattern);

    if (keys.length > 0) {
      await redisClient.del(keys);
    }

    next();
  } catch (error) {
    console.error("Cache invalidation error:", error);
    next();
  }
};
