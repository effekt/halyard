import type { RichTextBlock } from "@nubbin/core";

/** The plain text of some blocks, used as a render key — stable across a re-order. */
export function richTextText(blocks: readonly RichTextBlock[]): string {
  return blocks.flatMap((block) => block.spans.map((span) => span.text)).join("");
}
