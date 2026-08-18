import { z } from "zod";
import { featureItemSchema } from "./featureItem.schema";

/** The grid never renders more than four columns or fewer than two, so the count is closed. */
const MIN_COLUMNS = 2;
const MAX_COLUMNS = 4;

/** `columns` and `compact` are optional so every composition authored before they existed
 * validates to the same value it always did — nothing re-freezes, no artifact hash moves. */
export const featureGridSchema = z.object({
  heading: z.string(),
  tone: z.enum(["light", "dark"]),
  columns: z.number().int().min(MIN_COLUMNS).max(MAX_COLUMNS).optional(),
  compact: z.boolean().optional(),
  items: z.array(featureItemSchema),
});
