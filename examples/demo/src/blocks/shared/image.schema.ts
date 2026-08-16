import { z } from "zod";

/** A displayable image as inert data — a block renders it, the schema never carries a node. */
export const imageSchema = z.object({
  url: z.string(),
  alt: z.string(),
});
