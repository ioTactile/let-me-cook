import { AiPort } from "@/application/ports/ai.port";
import { CachePort } from "@/application/ports/cache.port";
import { ApplianceService } from "@/application/services/appliance.service";
import { AuthService } from "@/application/services/auth.service";
import { FridgeService } from "@/application/services/fridge.service";
import { RecipeService } from "@/application/services/recipe.service";
import { ShoppingListService } from "@/application/services/shopping-list.service";
import { OpenAIAdapter } from "@/infrastructure/openai/openai.adapter";
import { PrismaApplianceRepository } from "@/infrastructure/prisma/appliance.repository";
import { PrismaFridgeRepository } from "@/infrastructure/prisma/fridge.repository";
import { PrismaRecipeRepository } from "@/infrastructure/prisma/recipe.repository";
import { PrismaShoppingListRepository } from "@/infrastructure/prisma/shopping-list.repository";
import { PrismaUserRepository } from "@/infrastructure/prisma/user.repository";
import { RedisCacheAdapter } from "@/infrastructure/redis/cache.adapter";

const userRepository = new PrismaUserRepository();
const applianceRepository = new PrismaApplianceRepository();
const fridgeRepository = new PrismaFridgeRepository();
const recipeRepository = new PrismaRecipeRepository();
const shoppingListRepository = new PrismaShoppingListRepository();

const openaiAdapter = new OpenAIAdapter();
const redisCache = new RedisCacheAdapter();

export const aiPort: AiPort = openaiAdapter;
export const cachePort: CachePort = redisCache;
export { userRepository };

export const applianceService = new ApplianceService(applianceRepository);
export const fridgeService = new FridgeService(fridgeRepository, aiPort);
export const recipeService = new RecipeService(recipeRepository, aiPort);
export const shoppingListService = new ShoppingListService(
  shoppingListRepository,
  aiPort
);
export const authService = new AuthService(userRepository);

export function initializeOpenAI(): void {
  openaiAdapter.initialize();
}
