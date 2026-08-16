import { z } from "zod";

export const statItemSchema = z.object({
  value: z.string(),
  label: z.string(),
});
