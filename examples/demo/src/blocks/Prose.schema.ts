import { z } from "zod";

/** Plain paragraphs only — a string carrying markup is content the schema cannot see. */
export const proseSchema = z.object({
  heading: z.string(),
  tone: z.enum(["light", "dark"]),
  paragraphs: z.array(z.string()),
});
