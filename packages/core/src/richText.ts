import type { RichText } from "./richText.types";
import { richTextSchema } from "./richTextSchema";
import type { StandardDataSchema } from "./standardDataSchema.types";

/**
 * The rich-text field type: an ordered array of blocks, each an ordered array of inert spans,
 * over closed mark and kind sets. Nothing in the value is parsed or evaluated at render, so an
 * artifact carrying it is as inert as one carrying a string.
 *
 * A call rather than a bare value, so a field declaration reads the way the rest of a block's
 * schema does and so options can arrive without changing call sites that pass none. A scan for
 * this call finds every rich-text field in a registry.
 */
export function richText(): StandardDataSchema<RichText> {
  return richTextSchema;
}
