import "module-alias/register";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import { RedisStore } from "connect-redis";
import { createClient, RedisClientType } from "redis";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { recipeRoutes } from "@/routes/recipe.routes";
import { userRoutes } from "@/routes/user.routes";
import { fridgeRoutes } from "@/routes/fridge.routes";
import { applianceRoutes } from "@/routes/appliance.routes";
import { shoppingListRoutes } from "@/routes/shopping-list.routes";
import { aiRoutes } from "@/routes/ai.routes";
import { errorHandler } from "@/middleware/error.middleware";
import { authMiddleware } from "@/middleware/auth.middleware";
import { OpenAIService } from "@/services/openai.service";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 8000;

// Configuration Redis
const redisClient: RedisClientType = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

// Gestion des erreurs Redis
redisClient.connect().catch((error) => {
  console.error("Erreur de connexion Redis:", error);
  process.exit(1);
});

// Configuration de la session
app.use(
  session({
    store: new RedisStore({ client: redisClient as any }),
    secret:
      process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex"),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 heures
    },
    name: "sessionId",
  })
);

// Initialiser le service DeepSeek
OpenAIService.initialize();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// Middleware de nettoyage des ressources
app.use((req: Request, res: Response, next: NextFunction) => {
  res.on("finish", () => {
    // Nettoyer les ressources si nécessaire
    if (req.session) {
      (req.session as any).lastActivity = new Date();
    }
  });
  next();
});

// Routes publiques
app.use("/api/auth", userRoutes);

// Routes protégées
app.use("/api/recipes", authMiddleware, recipeRoutes);
app.use("/api/fridge", authMiddleware, fridgeRoutes);
app.use("/api/appliances", authMiddleware, applianceRoutes);
app.use("/api/shopping-lists", authMiddleware, shoppingListRoutes);
app.use("/api/ai", authMiddleware, aiRoutes);

// Error handling
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  try {
    await prisma.$disconnect();
    await redisClient.quit();
    console.log("Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
});
