import { z } from 'zod';

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  username: z.string().min(3),
});

export type RegisterInputs = z.infer<typeof registerSchema>;
