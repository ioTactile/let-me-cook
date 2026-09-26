import 'module-alias/register';
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import crypto from 'crypto';
import { prisma } from '@/infrastructure/prisma/client';
import { redisClient, connectRedis } from '@/infrastructure/redis/client';
import { initializeOpenAI } from '@/infrastructure/container';
import { recipeRoutes } from '@/routes/recipe.routes';
import { userRoutes } from '@/routes/user.routes';
import { fridgeRoutes } from '@/routes/fridge.routes';
import { applianceRoutes } from '@/routes/appliance.routes';
import { shoppingListRoutes } from '@/routes/shopping-list.routes';
import { aiRoutes } from '@/routes/ai.routes';
import { errorHandler } from '@/middleware/error.middleware';
import { authMiddleware } from '@/middleware/auth.middleware';

const app = express();
const port = process.env.PORT || 8000;

connectRedis().catch((error) => {
  console.error('Erreur de connexion Redis:', error);
  process.exit(1);
});

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
    name: 'sessionId',
  }),
);

initializeOpenAI();

app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:8081',
      'exp://',
      'http://localhost:19000',
      'http://localhost:19001',
      'http://localhost:19002',
      'http://192.168.1.55:8081',
    ],
    credentials: true,
  }),
);
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  res.on('finish', () => {
    if (req.session) {
      (req.session as any).lastActivity = new Date();
    }
  });
  next();
});

app.use('/api/auth', userRoutes);

app.use('/api/recipes', authMiddleware, recipeRoutes);
app.use('/api/fridge', authMiddleware, fridgeRoutes);
app.use('/api/appliances', authMiddleware, applianceRoutes);
app.use('/api/shopping-lists', authMiddleware, shoppingListRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

process.on('SIGINT', async () => {
  try {
    await prisma.$disconnect();
    await redisClient.quit();
    console.log('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});
