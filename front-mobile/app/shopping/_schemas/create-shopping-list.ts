import { z } from 'zod';
import { Unit } from '@/types/enums';

export const createShoppingListSchema = z.object({
  name: z.string().min(1, 'Le nom de la liste est requis'),
  items: z.array(
    z.object({
      ingredientName: z.string().min(1, "Le nom de l'ingrédient est requis"),
      quantity: z.number().min(0.1, 'La quantité doit être supérieure à 0'),
      unit: z.enum(Unit),
    }),
  ),
});

export type CreateShoppingListInputs = z.infer<typeof createShoppingListSchema>;
