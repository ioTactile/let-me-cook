import OpenAI from "openai";
import { AppError } from "@/middleware/error.middleware";

export class OpenAIService {
  private static client: OpenAI;

  private static ensureInitialized() {
    if (!this.client) {
      this.initialize();
    }
  }

  static initialize() {
    if (!process.env.OPENAI_API_KEY) {
      throw new AppError("La clé API OpenAI n'est pas configurée", 500);
    }
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  static async generateEmbedding(text: string): Promise<number[]> {
    try {
      this.ensureInitialized();
      const response = await this.client.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
        encoding_format: "float",
      });
      return response.data[0].embedding;
    } catch (error) {
      throw new AppError("Erreur lors de la génération de l'embedding", 500);
    }
  }

  static async analyzeIngredient(ingredientName: string) {
    try {
      this.ensureInitialized();
      const prompt = `
        Analysez l'ingrédient suivant et fournissez:
        1. Les valeurs nutritionnelles principales
        2. Les allergènes potentiels
        3. La durée de conservation recommandée
        4. Les conditions de stockage optimales
        5. Des alternatives possibles
        
        Ingrédient: ${ingredientName}
      `;

      const response = await this.client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Vous êtes un expert en nutrition et en analyse d'ingrédients.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.5,
        max_tokens: 500,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.log("error analyze ingredient", error);
      throw new AppError("Erreur lors de l'analyse de l'ingrédient", 500);
    }
  }

  static async generateRecipeSuggestions(
    ingredients: string[],
    appliances: string[]
  ) {
    try {
      this.ensureInitialized();
      const prompt = `
        En tant qu'expert culinaire, suggérez des recettes possibles avec les ingrédients suivants:
        Ingrédients disponibles: ${ingredients.join(", ")}
        Appareils disponibles: ${appliances.join(", ")}
        
        Pour chaque recette, fournissez:
        1. Un titre
        2. La liste des ingrédients nécessaires
        3. Les étapes de préparation
        4. Le temps de préparation estimé
        5. Le niveau de difficulté
      `;

      const response = await this.client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Vous êtes un expert culinaire qui aide à créer des recettes avec les ingrédients disponibles.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.log("error generate recipe suggestions", error);
      throw new AppError(
        "Erreur lors de la génération des suggestions de recettes",
        500
      );
    }
  }

  static async analyzeRecipe(recipe: string) {
    try {
      this.ensureInitialized();
      const prompt = `
        Analysez la recette suivante et fournissez:
        1. Les points forts nutritionnels
        2. Les allergènes potentiels
        3. Des suggestions d'amélioration
        4. Des alternatives d'ingrédients si nécessaire
        
        Recette: ${recipe}
      `;

      const response = await this.client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Vous êtes un expert en nutrition et en analyse culinaire.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.5,
        max_tokens: 800,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.log("error analyze recipe", error);
      throw new AppError("Erreur lors de l'analyse de la recette", 500);
    }
  }

  static async generateShoppingList(recipe: string) {
    try {
      this.ensureInitialized();
      const prompt = `
        À partir de la recette suivante, générez une liste de courses détaillée avec les quantités:
        
        Recette: ${recipe}
        
        Format de sortie souhaité:
        - Ingrédient 1: quantité unité
        - Ingrédient 2: quantité unité
        etc.
      `;

      const response = await this.client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Vous êtes un assistant qui aide à créer des listes de courses précises.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.log("error generate shopping list", error);
      throw new AppError(
        "Erreur lors de la génération de la liste de courses",
        500
      );
    }
  }
}
