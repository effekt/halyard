import { z } from "zod";
import { ctaSchema } from "./shared/cta.schema";

export const footerColumnSchema = z.object({
  heading: z.string(),
  links: z.array(ctaSchema),
});
