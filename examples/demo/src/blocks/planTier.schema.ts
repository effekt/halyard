import { z } from "zod";

export const planTierSchema = z.object({
  name: z.string(),
  price: z.string(),
  unit: z.string(),
  description: z.string(),
  features: z.array(z.string()),
  recommended: z.boolean(),
});
