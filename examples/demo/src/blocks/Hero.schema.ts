import { z } from "zod";
import { ctaSchema } from "./shared/cta.schema";
import { imageSchema } from "./shared/image.schema";

export const heroSchema = z.object({
  eyebrow: z.string(),
  headline: z.string(),
  body: z.string(),
  tone: z.enum(["light", "dark"]),
  cta: ctaSchema,
  image: imageSchema,
});
