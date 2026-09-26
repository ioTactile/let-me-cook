import { z } from 'zod';

export const createFridgeItemSchema = z.object({
  ingredientName: z.string().min(1, "Le nom de l'ingrédient est requis"),
  quantity: z.number().min(0.1, 'La quantité doit être supérieure à 0'),
  unit: z.string().min(1, "L'unité est requise"),
  expiryDate: z.date().nullable(),
});

export type CreateFridgeItemInputs = z.infer<typeof createFridgeItemSchema>;
