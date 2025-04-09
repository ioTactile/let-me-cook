import { z } from "zod";
import { Unit } from "@/types/enums";

export const createShoppingListItemSchema = z.object({
  ingredientName: z.string().min(1, "Le nom de l'ingrédient est requis"),
  quantity: z.number().min(0.1, "La quantité doit être supérieure à 0"),
  unit: z.nativeEnum(Unit),
});

export type CreateShoppingListItemInputs = z.infer<
  typeof createShoppingListItemSchema
>;
