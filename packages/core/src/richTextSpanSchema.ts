import { defineStandardSchema } from "./defineStandardSchema";
import { RICH_TEXT_MARKS } from "./richText.constants";
import type { RichTextSpan } from "./richText.types";
import { richTextSpanIssues } from "./richTextSpanIssues";

/** A run of text, the marks that hold over it, and an optional destination. */
export const richTextSpanSchema = defineStandardSchema<RichTextSpan>(richTextSpanIssues, () => ({
  type: "object",
  properties: {
    text: { type: "string" },
    marks: { type: "array", items: { type: "string", enum: [...RICH_TEXT_MARKS] } },
    href: { type: "string" },
  },
  required: ["text"],
  additionalProperties: false,
}));
