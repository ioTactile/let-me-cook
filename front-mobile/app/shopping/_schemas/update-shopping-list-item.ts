import { z } from "zod";
import { ShoppingListItemStatus, Unit } from "@/types/enums";

export const updateShoppingListItemSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      status: z.nativeEnum(ShoppingListItemStatus).optional(),
      quantity: z.number().optional(),
      unit: z.nativeEnum(Unit).optional(),
    })
  ),
});

export type UpdateShoppingListItemInputs = z.infer<
  typeof updateShoppingListItemSchema
>;
