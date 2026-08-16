import { z } from "zod";
import { featureItemSchema } from "./featureItem.schema";

export const featureGridSchema = z.object({
  heading: z.string(),
  tone: z.enum(["light", "dark"]),
  items: z.array(featureItemSchema),
});
