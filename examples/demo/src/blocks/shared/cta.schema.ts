import { z } from "zod";

/** A labelled destination, reused wherever a block needs one action or one link. */
export const ctaSchema = z.object({
  label: z.string(),
  href: z.string(),
});
