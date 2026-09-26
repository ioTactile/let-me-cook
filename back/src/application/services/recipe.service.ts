import { AiPort } from "@/application/ports/ai.port";
import { RecipeRepository } from "@/application/ports/recipe.repository";
import { AppError } from "@/domain/errors/app-error";
import {
  Recipe,
  CreateRecipeDto,
  UpdateRecipeDto,
  RecipeSearchContext,
} from "@/types/recipe.types";

export class RecipeService {
  constructor(
    private readonly recipeRepository: RecipeRepository,
    private readonly ai: AiPort
  ) {}

  private validateRecipeData(
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

  private prepareRecipeForEmbedding(recipe: CreateRecipeDto) {
    return {
      title: recipe.title,
      ingredients: recipe.ingredients
        .map((i) => `${i.quantity} ${i.unit} de ${i.name}`)
        .join(", "),
      instructions: Array.isArray(recipe.instructions)
        ? recipe.instructions.join(" ")
        : recipe.instructions,
      cookingTime: `Temps de cuisson: ${recipe.cookingTime} minutes`,
      difficulty: `Difficulté: ${recipe.difficulty}`,
      appliances: `Appareils nécessaires: ${
        Array.isArray(recipe.appliances) ? recipe.appliances.join(", ") : ""
      }`,
    };
  }

  private async generateEmbeddingsForRecipe(recipe: CreateRecipeDto) {
    const chunks = this.prepareRecipeForEmbedding(recipe);
    const embeddings = await Promise.all(
      Object.entries(chunks).map(async ([key, value]) => ({
        key,
        embedding: await this.ai.generateEmbedding(value),
      }))
    );

    return embeddings.reduce(
      (acc, { key, embedding }) => {
        acc[key] = embedding;
        return acc;
      },
      {} as Record<string, number[]>
    );
  }

  async createRecipe(recipeData: CreateRecipeDto): Promise<Recipe> {
    try {
      this.validateRecipeData(recipeData);
      const embeddings = await this.generateEmbeddingsForRecipe(recipeData);
      return await this.recipeRepository.create(recipeData, embeddings);
    } catch (error) {
      console.log("error create recipe", error);
      if (error instanceof AppError) throw error;
      throw new AppError("Erreur lors de la création de la recette", 500);
    }
  }

  async getRecipeById(id: string): Promise<Recipe> {
    const recipe = await this.recipeRepository.findById(id);
    if (!recipe) {
      throw new AppError("Recette non trouvée", 404);
    }
    return recipe;
  }

  async findSimilarRecipes(
    userContext: RecipeSearchContext
  ): Promise<Recipe[]> {
    try {
      if (!userContext.fridgeItems?.length && !userContext.appliances?.length) {
        throw new AppError("Aucun contexte fourni pour la recherche", 400);
      }

      const searchChunks = {
        ingredients: `Ingrédients disponibles: ${userContext.fridgeItems.join(
          ", "
        )}`,
        appliances: `Appareils disponibles: ${userContext.appliances.join(
          ", "
        )}`,
      };

      const [ingredientsEmbedding, appliancesEmbedding] = await Promise.all([
        this.ai.generateEmbedding(searchChunks.ingredients),
        this.ai.generateEmbedding(searchChunks.appliances),
      ]);

      return await this.recipeRepository.findSimilar(userContext, {
        ingredients: ingredientsEmbedding,
        appliances: appliancesEmbedding,
      });
    } catch (error) {
      console.log("error find similar recipes", error);
      if (error instanceof AppError) throw error;
      throw new AppError("Erreur lors de la recherche de recettes", 500);
    }
  }

  async updateRecipe(
    id: string,
    recipeData: UpdateRecipeDto
  ): Promise<Recipe> {
    try {
      const existingRecipe = await this.recipeRepository.findById(id);
      if (!existingRecipe) {
        throw new AppError("Recette non trouvée", 404);
      }

      if (
        recipeData.title ||
        recipeData.ingredients ||
        recipeData.instructions ||
        recipeData.cookingTime ||
        recipeData.difficulty ||
        recipeData.appliances
      ) {
        this.validateRecipeData(recipeData);
      }

      const mergedData: CreateRecipeDto = {
        title: recipeData.title ?? existingRecipe.title,
        ingredients: recipeData.ingredients ?? existingRecipe.ingredients,
        instructions: recipeData.instructions ?? existingRecipe.instructions,
        cookingTime: recipeData.cookingTime ?? existingRecipe.cookingTime,
        difficulty: recipeData.difficulty ?? existingRecipe.difficulty,
        appliances: recipeData.appliances ?? existingRecipe.appliances,
        metadata: recipeData.metadata ?? existingRecipe.metadata,
      };

      const embeddings = await this.generateEmbeddingsForRecipe(mergedData);
      return await this.recipeRepository.update(id, recipeData, embeddings);
    } catch (error) {
      console.log("error update recipe", error);
      if (error instanceof AppError) throw error;
      throw new AppError("Erreur lors de la mise à jour de la recette", 500);
    }
  }

  async deleteRecipe(id: string): Promise<void> {
    try {
      await this.recipeRepository.delete(id);
    } catch (error) {
      console.log("error delete recipe", error);
      throw new AppError("Erreur lors de la suppression de la recette", 500);
    }
  }
}
