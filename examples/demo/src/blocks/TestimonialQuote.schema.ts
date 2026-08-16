import { z } from "zod";
import { imageSchema } from "./shared/image.schema";

export const testimonialQuoteSchema = z.object({
  quote: z.string(),
  name: z.string(),
  role: z.string(),
  avatar: imageSchema,
  tone: z.enum(["light", "dark"]),
});
