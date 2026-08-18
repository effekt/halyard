import { z } from "zod";

/** `headline`, matching `Hero` — the variant classification rests on this schema being a
 * subset of `heroSchema`, so the shared fields keep `Hero`'s names. */
export const pageHeaderSchema = z.object({
  eyebrow: z.string(),
  headline: z.string(),
  body: z.string(),
  tone: z.enum(["light", "dark"]),
});
