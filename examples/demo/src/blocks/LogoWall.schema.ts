import { z } from "zod";
import { imageSchema } from "./shared/image.schema";

export const logoWallSchema = z.object({
  heading: z.string(),
  tone: z.enum(["light", "dark"]),
  logos: z.array(imageSchema),
});
