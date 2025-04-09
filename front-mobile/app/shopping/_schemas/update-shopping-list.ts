import { z } from "zod";

export const updateShoppingListSchema = z.object({
  name: z.string().min(1, "Le nom de la liste est requis"),
});

export type UpdateShoppingListInputs = z.infer<typeof updateShoppingListSchema>;
