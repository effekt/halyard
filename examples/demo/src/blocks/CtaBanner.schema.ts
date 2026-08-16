import { z } from "zod";
import { ctaSchema } from "./shared/cta.schema";

export const ctaBannerSchema = z.object({
  heading: z.string(),
  body: z.string(),
  tone: z.enum(["light", "dark"]),
  cta: ctaSchema,
});
