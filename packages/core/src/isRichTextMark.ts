import { RICH_TEXT_MARKS } from "./richText.constants";
import type { RichTextMark } from "./richText.types";

/** Narrows a value to a member of the closed mark set. */
export function isRichTextMark(value: unknown): value is RichTextMark {
  return RICH_TEXT_MARKS.some((mark) => mark === value);
}
