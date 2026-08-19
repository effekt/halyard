import { RICH_TEXT_BLOCK_KINDS } from "./richText.constants";
import type { RichTextBlockKind } from "./richText.types";

/** Narrows a value to a member of the closed block-kind set. */
export function isRichTextBlockKind(value: unknown): value is RichTextBlockKind {
  return RICH_TEXT_BLOCK_KINDS.some((kind) => kind === value);
}
