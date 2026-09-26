import OpenAI from 'openai';
import { AiPort } from '@/application/ports/ai.port';
import { AppError } from '@/domain/errors/app-error';

export class OpenAIAdapter implements AiPort {
  private client: OpenAI | null = null;

  initialize(): void {
    if (!process.env.OPENAI_API_KEY) {
      throw new AppError("La clé API OpenAI n'est pas configurée", 500);
    }
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  private ensureInitialized(): OpenAI {
    if (!this.client) {
      this.initialize();
    }
    return this.client!;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const client = this.ensureInitialized();
      const response = await client.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
        encoding_format: 'float',
      });
      return response.data[0].embedding;
    } catch {
      throw new AppError("Erreur lors de la génération de l'embedding", 500);
    }
  }

  async analyzeIngredient(ingredientName: string): Promise<string | null> {
    try {
      const client = this.ensureInitialized();
      const prompt = `
        Analysez l'ingrédient suivant et fournissez:
        1. Les valeurs nutritionnelles principales
        2. Les allergènes potentiels
        3. La durée de conservation recommandée
        4. Les conditions de stockage optimales
        5. Des alternatives possibles
        
        Ingrédient: ${ingredientName}
      `;

      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: "Vous êtes un expert en nutrition et en analyse d'ingrédients.",
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 1000,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.log('error analyze ingredient', error);
      throw new AppError("Erreur lors de l'analyse de l'ingrédient", 500);
    }
  }

  async generateRecipeSuggestions(
    ingredients: string[],
    appliances: string[],
  ): Promise<string | null> {
    try {
      const client = this.ensureInitialized();
      const prompt = `
        En tant qu'expert culinaire, suggérez des recettes possibles avec les ingrédients suivants:
        Ingrédients disponibles: ${ingredients.join(', ')}
        Appareils disponibles: ${appliances.join(', ')}
        
        Pour chaque recette, fournissez:
        1. Un titre
        2. La liste des ingrédients nécessaires
        3. Les étapes de préparation
        4. Le temps de préparation estimé
        5. Le niveau de difficulté
      `;

      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'Vous êtes un expert culinaire qui aide à créer des recettes avec les ingrédients disponibles.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.log('error generate recipe suggestions', error);
      throw new AppError('Erreur lors de la génération des suggestions de recettes', 500);
    }
  }

  async analyzeRecipe(recipe: string): Promise<string | null> {
    try {
      const client = this.ensureInitialized();
      const prompt = `
        Analysez la recette suivante et fournissez:
        1. Les points forts nutritionnels
        2. Les allergènes potentiels
        3. Des suggestions d'amélioration
        4. Des alternatives d'ingrédients si nécessaire
        
        Recette: ${recipe}
      `;

      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Vous êtes un expert en nutrition et en analyse culinaire.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 800,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.log('error analyze recipe', error);
      throw new AppError("Erreur lors de l'analyse de la recette", 500);
    }
  }

  async generateShoppingList(recipe: string): Promise<string | null> {
    try {
      const client = this.ensureInitialized();
      const prompt = `
        À partir de la recette suivante, générez une liste de courses détaillée avec les quantités:
        
        Recette: ${recipe}
        
        Format de sortie souhaité:
        - Ingrédient 1: quantité unité
        - Ingrédient 2: quantité unité
        etc.
      `;

      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Vous êtes un assistant qui aide à créer des listes de courses précises.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 500,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.log('error generate shopping list', error);
      throw new AppError('Erreur lors de la génération de la liste de courses', 500);
    }
  }

  async generateIngredientImageUrl(ingredientName: string): Promise<string> {
    try {
      const client = this.ensureInitialized();
      const prompt = `
        Trouvez une image de haute qualité de l'ingrédient suivant sur Unsplash.
        L'image doit être :
        - Une photo réelle de l'ingrédient
        - Bien éclairée et professionnelle
        - Centrée sur l'ingrédient
        - Sans texte ou filigrane
        
        Ingrédient: ${ingredientName}
        
        Répondez uniquement avec l'URL directe de l'image Unsplash, sans texte supplémentaire.
        L'URL doit être de la forme : https://images.unsplash.com/photo-XXXXXXXXXXXX
      `;

      const response = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              "Vous êtes un assistant spécialisé dans la recherche d'images culinaires sur Unsplash. Vous denez toujours répondre avec une URL directe d'image Unsplash, sans texte supplémentaire. L'image doit être pertinente et de haute qualité.",
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 200,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new AppError("Impossible de générer une URL d'image valide", 500);
      }

      if (!content.startsWith('https://images.unsplash.com/photo-')) {
        throw new AppError("L'URL générée n'est pas une URL Unsplash valide", 500);
      }

      return content;
    } catch (error) {
      console.log('error generate ingredient image url', error);
      if (error instanceof AppError) throw error;
      throw new AppError("Erreur lors de la génération de l'URL de l'image", 500);
    }
  }
}
