import { defineStandardSchema } from "./defineStandardSchema";
import type { RichText } from "./richText.types";
import { richTextBlockSchema } from "./richTextBlockSchema";
import { richTextIssues } from "./richTextIssues";

/** The whole value a rich-text field holds: an ordered array of blocks. */
export const richTextSchema = defineStandardSchema<RichText>(richTextIssues, (options) => ({
  type: "array",
  items: richTextBlockSchema["~standard"].jsonSchema.input(options),
}));
