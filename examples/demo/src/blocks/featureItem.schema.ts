import { z } from "zod";

/** A closed icon set, not a free string — the renderer maps each name to one fixed glyph. */
export const featureItemSchema = z.object({
  icon: z.enum(["chart", "shield", "bolt", "layers"]),
  title: z.string(),
  body: z.string(),
});
