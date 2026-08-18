import { z } from "zod";

export const changelogEntrySchema = z.object({
  date: z.string(),
  tag: z.enum(["added", "improved", "fixed"]),
  title: z.string(),
  paragraphs: z.array(z.string()),
});
