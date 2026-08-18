import { z } from "zod";
import { planTierSchema } from "./planTier.schema";

export const planTiersSchema = z.object({
  heading: z.string(),
  tone: z.enum(["light", "dark"]),
  tiers: z.array(planTierSchema),
});
