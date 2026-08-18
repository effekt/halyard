import type { z } from "zod";
import type { changelogListSchema } from "./ChangelogList.schema";

export const changelogListDefaults: z.infer<typeof changelogListSchema> = {
  tone: "light",
  entries: [
    {
      date: "2026-01-05",
      tag: "added",
      title: "A first entry",
      paragraphs: ["What changed, in a sentence a reader outside the team can follow."],
    },
  ],
};
