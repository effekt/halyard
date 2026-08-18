import { z } from "zod";
import { changelogEntrySchema } from "./changelogEntry.schema";

/** No `heading`, deliberately: the entry list sits under the page header with no `h2` of its
 * own, matching the coded original. */
export const changelogListSchema = z.object({
  tone: z.enum(["light", "dark"]),
  entries: z.array(changelogEntrySchema),
});
