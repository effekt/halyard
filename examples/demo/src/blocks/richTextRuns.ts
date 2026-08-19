import type { RichText, RichTextBlock } from "@nubbin/core";

/**
 * Groups consecutive list items into one run so they render as one list. Every other block is
 * a run of its own — the document is a flat array, and the nesting is the renderer's business.
 */
export function richTextRuns(body: RichText): RichTextBlock[][] {
  const runs: RichTextBlock[][] = [];
  for (const block of body) {
    const open = runs.at(-1);
    if (block.kind === "listItem" && open?.[0]?.kind === "listItem") {
      open.push(block);
    } else {
      runs.push([block]);
    }
  }
  return runs;
}
