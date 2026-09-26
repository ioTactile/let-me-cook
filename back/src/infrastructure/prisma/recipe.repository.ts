import type { Prisma } from '@/generated/prisma/client';
import { RecipeRepository } from '@/application/ports/recipe.repository';
import { AppError } from '@/domain/errors/app-error';
import { prisma } from '@/infrastructure/prisma/client';
import {
  Recipe,
  CreateRecipeDto,
  UpdateRecipeDto,
  RecipeSearchContext,
} from '@/types/recipe.types';

export class PrismaRecipeRepository implements RecipeRepository {
  private toRecipe(prismaRecipe: Prisma.RecipeGetPayload<object> | any): Recipe {
    return {
      id: prismaRecipe.id,
      title: prismaRecipe.title,
      ingredients: prismaRecipe.ingredients as unknown as Recipe['ingredients'],
      instructions: prismaRecipe.instructions,
      cookingTime: prismaRecipe.cookingTime ?? prismaRecipe.cooking_time,
      difficulty: prismaRecipe.difficulty,
      appliances: prismaRecipe.appliances,
      metadata: prismaRecipe.metadata as Recipe['metadata'],
      embedding: prismaRecipe.embedding as unknown as Record<string, number[]>,
      createdAt: prismaRecipe.createdAt ?? prismaRecipe.created_at,
      updatedAt: prismaRecipe.updatedAt ?? prismaRecipe.updated_at,
    };
  }

  async create(data: CreateRecipeDto, embedding: Record<string, number[]>): Promise<Recipe> {
    const prismaRecipe = await prisma.recipe.create({
      data: {
        title: data.title,
        ingredients: data.ingredients as unknown as Prisma.InputJsonValue,
        instructions: data.instructions,
        cookingTime: data.cookingTime,
        difficulty: data.difficulty,
        appliances: data.appliances,
        metadata: data.metadata as Prisma.InputJsonValue,
        embedding: embedding as unknown as Prisma.InputJsonValue,
      },
    });
    return this.toRecipe(prismaRecipe);
  }

  async findById(id: string): Promise<Recipe | null> {
    const prismaRecipe = await prisma.recipe.findUnique({ where: { id } });
    return prismaRecipe ? this.toRecipe(prismaRecipe) : null;
  }

  async update(
    id: string,
    data: UpdateRecipeDto,
    embedding: Record<string, number[]>,
  ): Promise<Recipe> {
    const prismaRecipe = await prisma.recipe.update({
      where: { id },
      data: {
        title: data.title,
        ingredients: data.ingredients as unknown as Prisma.InputJsonValue,
        instructions: data.instructions,
        cookingTime: data.cookingTime,
        difficulty: data.difficulty,
        appliances: data.appliances,
        metadata: data.metadata as Prisma.InputJsonValue,
        embedding: embedding as unknown as Prisma.InputJsonValue,
      },
    });
    return this.toRecipe(prismaRecipe);
  }

  async delete(id: string): Promise<void> {
    await prisma.recipe.delete({ where: { id } });
  }

  async findSimilar(
    context: RecipeSearchContext,
    embeddings: { ingredients: number[]; appliances: number[] },
  ): Promise<Recipe[]> {
    const prismaRecipes = await Promise.race([
      prisma.$queryRaw`
        SELECT 
          id,
          title,
          ingredients,
          instructions,
          "cookingTime" as "cooking_time",
          difficulty,
          appliances,
          metadata,
          embedding,
          "createdAt" as "created_at",
          "updatedAt" as "updated_at",
          (
            (1 - (embedding->>'ingredients'::vector <-> ${embeddings.ingredients}::vector)) * 0.6 +
            (1 - (embedding->>'appliances'::vector <-> ${embeddings.appliances}::vector)) * 0.4
          ) as similarity
        FROM "Recipe"
        WHERE 
          "cookingTime" <= ${context.maxCookingTime || 120}
          AND (
            ${context.appliances} IS NULL 
            OR appliances && ${context.appliances}::text[]
          )
        ORDER BY similarity DESC
        LIMIT 5
      `,
      new Promise((_, reject) =>
        setTimeout(() => reject(new AppError('Timeout de la requête', 504)), 5000),
      ),
    ]);

    return (prismaRecipes as any[]).map((recipe) => this.toRecipe(recipe));
  }
}
