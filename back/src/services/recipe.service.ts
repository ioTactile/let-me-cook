import { PrismaClient } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { AppError } from "@/middleware/error.middleware";
import { OpenAIService } from "@/services/openai.service";
import {
  Recipe,
  CreateRecipeDto,
  UpdateRecipeDto,
  RecipeSearchContext,
} from "@/types/recipe.types";

const prisma = new PrismaClient();

export class RecipeService {
  private static validateRecipeData(
    data: CreateRecipeDto | UpdateRecipeDto
  ): void {
    if (data.title !== undefined && !data.title.trim()) {
      throw new AppError("Le titre de la recette est requis", 400);
    }
    if (
      data.ingredients !== undefined &&
      (!Array.isArray(data.ingredients) || data.ingredients.length === 0)
    ) {
      throw new AppError("Au moins un ingrédient est requis", 400);
    }
    if (
      data.instructions !== undefined &&
      (!Array.isArray(data.instructions) || data.instructions.length === 0)
    ) {
      throw new AppError("Les instructions sont requises", 400);
    }
    if (
      data.cookingTime !== undefined &&
      (!data.cookingTime || data.cookingTime <= 0)
    ) {
      throw new AppError("Le temps de cuisson doit être positif", 400);
    }
    if (
      data.difficulty !== undefined &&
      !["easy", "medium", "hard"].includes(data.difficulty)
    ) {
      throw new AppError(
        "La difficulté doit être 'easy', 'medium' ou 'hard'",
        400
      );
    }
    if (data.appliances !== undefined && !Array.isArray(data.appliances)) {
      throw new AppError("Les appareils doivent être un tableau", 400);
    }
  }

  private static prepareRecipeForEmbedding(recipe: CreateRecipeDto) {
    const instructions = Array.isArray(recipe.instructions)
      ? recipe.instructions.join(" ")
      : recipe.instructions;

    const appliances = Array.isArray(recipe.appliances)
      ? recipe.appliances.join(", ")
      : "";

    return `
      Titre: ${recipe.title}
      Ingrédients: ${recipe.ingredients
        .map((i) => `${i.quantity} ${i.unit} de ${i.name}`)
        .join(", ")}
      Instructions: ${instructions}
      Temps de cuisson: ${recipe.cookingTime}
      Difficulté: ${recipe.difficulty}
      Appareils: ${appliances}
    `;
  }

  private static toPrismaRecipe(
    data: CreateRecipeDto
  ): Prisma.RecipeCreateInput {
    this.validateRecipeData(data);
    return {
      title: data.title,
      ingredients: data.ingredients as unknown as Prisma.InputJsonValue,
      instructions: data.instructions,
      cookingTime: data.cookingTime,
      difficulty: data.difficulty,
      appliances: data.appliances,
      metadata: data.metadata as Prisma.InputJsonValue,
    };
  }

  private static toPrismaUpdate(
    data: UpdateRecipeDto
  ): Prisma.RecipeUpdateInput {
    if (
      data.title ||
      data.ingredients ||
      data.instructions ||
      data.cookingTime ||
      data.difficulty ||
      data.appliances
    ) {
      this.validateRecipeData(data);
    }
    return {
      title: data.title,
      ingredients: data.ingredients as unknown as Prisma.InputJsonValue,
      instructions: data.instructions,
      cookingTime: data.cookingTime,
      difficulty: data.difficulty,
      appliances: data.appliances,
      metadata: data.metadata as Prisma.InputJsonValue,
    };
  }

  private static toRecipe(prismaRecipe: Prisma.RecipeGetPayload<{}>): Recipe {
    return {
      id: prismaRecipe.id,
      title: prismaRecipe.title,
      ingredients: prismaRecipe.ingredients as unknown as Recipe["ingredients"],
      instructions: prismaRecipe.instructions,
      cookingTime: prismaRecipe.cookingTime,
      difficulty: prismaRecipe.difficulty,
      appliances: prismaRecipe.appliances,
      metadata: prismaRecipe.metadata as Recipe["metadata"],
      embedding: prismaRecipe.embedding,
      createdAt: prismaRecipe.createdAt,
      updatedAt: prismaRecipe.updatedAt,
    };
  }

  static async createRecipe(recipeData: CreateRecipeDto): Promise<Recipe> {
    try {
      const textToEmbed = this.prepareRecipeForEmbedding(recipeData);
      const embedding = await OpenAIService.generateEmbedding(textToEmbed);

      const prismaRecipe = await prisma.recipe.create({
        data: {
          ...this.toPrismaRecipe(recipeData),
          embedding,
        },
      });

      return this.toRecipe(prismaRecipe);
    } catch (error) {
      console.log("error create recipe", error);
      if (error instanceof AppError) throw error;
      throw new AppError("Erreur lors de la création de la recette", 500);
    }
  }

  static async findSimilarRecipes(
    userContext: RecipeSearchContext
  ): Promise<Recipe[]> {
    try {
      if (!userContext.fridgeItems?.length && !userContext.appliances?.length) {
        throw new AppError("Aucun contexte fourni pour la recherche", 400);
      }

      const searchText = `
        Ingrédients disponibles: ${userContext.fridgeItems.join(", ")}
        Appareils disponibles: ${userContext.appliances.join(", ")}
      `;
      const searchEmbedding = await OpenAIService.generateEmbedding(searchText);

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
            1 - (embedding::vector <-> ${searchEmbedding}::vector) as similarity
          FROM "Recipe"
          WHERE 
            "cookingTime" <= ${userContext.maxCookingTime || 120}
            AND (
              ${userContext.appliances} IS NULL 
              OR appliances && ${userContext.appliances}::text[]
            )
          ORDER BY embedding::vector <-> ${searchEmbedding}::vector
          LIMIT 5
        `,
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new AppError("Timeout de la requête", 504)),
            5000
          )
        ),
      ]);

      return (prismaRecipes as any[]).map((recipe) => this.toRecipe(recipe));
    } catch (error) {
      console.log("error find similar recipes", error);
      if (error instanceof AppError) throw error;
      throw new AppError("Erreur lors de la recherche de recettes", 500);
    }
  }

  static async getRecipeById(id: string): Promise<Recipe> {
    const prismaRecipe = await prisma.recipe.findUnique({
      where: { id },
    });

    if (!prismaRecipe) {
      throw new AppError("Recette non trouvée", 404);
    }

    return this.toRecipe(prismaRecipe);
  }

  static async updateRecipe(
    id: string,
    recipeData: UpdateRecipeDto
  ): Promise<Recipe> {
    try {
      // Récupérer la recette existante
      const existingRecipe = await prisma.recipe.findUnique({
        where: { id },
      });

      if (!existingRecipe) {
        throw new AppError("Recette non trouvée", 404);
      }

      // Fusionner les données existantes avec les mises à jour
      const mergedData: CreateRecipeDto = {
        title: recipeData.title ?? existingRecipe.title,
        ingredients:
          recipeData.ingredients ??
          (existingRecipe.ingredients as unknown as Recipe["ingredients"]),
        instructions: recipeData.instructions ?? existingRecipe.instructions,
        cookingTime: recipeData.cookingTime ?? existingRecipe.cookingTime,
        difficulty: recipeData.difficulty ?? existingRecipe.difficulty,
        appliances: recipeData.appliances ?? existingRecipe.appliances,
        metadata:
          recipeData.metadata ??
          (existingRecipe.metadata as Recipe["metadata"]),
      };

      // Générer le nouvel embedding avec les données fusionnées
      const textToEmbed = this.prepareRecipeForEmbedding(mergedData);
      const embedding = await OpenAIService.generateEmbedding(textToEmbed);

      const prismaRecipe = await prisma.$transaction(async (tx) => {
        return await tx.recipe.update({
          where: { id },
          data: {
            ...this.toPrismaUpdate(recipeData),
            embedding,
          },
        });
      });

      return this.toRecipe(prismaRecipe);
    } catch (error) {
      console.log("error update recipe", error);
      if (error instanceof AppError) throw error;
      throw new AppError("Erreur lors de la mise à jour de la recette", 500);
    }
  }

  static async deleteRecipe(id: string): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.recipe.delete({
          where: { id },
        });
      });
    } catch (error) {
      console.log("error delete recipe", error);
      throw new AppError("Erreur lors de la suppression de la recette", 500);
    }
  }
}
