import { z } from "zod";
import { statItemSchema } from "./statItem.schema";

export const statBandSchema = z.object({
  tone: z.enum(["light", "dark"]),
  stats: z.array(statItemSchema),
});
