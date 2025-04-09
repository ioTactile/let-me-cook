import { z } from "zod";

export const createApplianceSchema = z.object({
  name: z.string().min(1, "Le nom de l'appareil est requis"),
  description: z.string().nullable(),
});

export type CreateApplianceInputs = z.infer<typeof createApplianceSchema>;
