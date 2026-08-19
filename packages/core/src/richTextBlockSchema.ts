import { defineStandardSchema } from "./defineStandardSchema";
import { RICH_TEXT_BLOCK_KINDS } from "./richText.constants";
import type { RichTextBlock } from "./richText.types";
import { richTextBlockIssues } from "./richTextBlockIssues";
import { richTextSpanSchema } from "./richTextSpanSchema";

/** One block of a rich-text value: a closed kind, and the spans it reads as. */
export const richTextBlockSchema = defineStandardSchema<RichTextBlock>(
  richTextBlockIssues,
  (options) => ({
    type: "object",
    properties: {
      kind: { type: "string", enum: [...RICH_TEXT_BLOCK_KINDS] },
      spans: { type: "array", items: richTextSpanSchema["~standard"].jsonSchema.input(options) },
    },
    required: ["kind", "spans"],
    additionalProperties: false,
  }),
);
