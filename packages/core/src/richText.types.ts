/**
 * The inline emphasis a span may carry. Semantic, never stylistic, and closed: a construct
 * outside this set is added as a member deliberately, not smuggled in as markup.
 */
export type RichTextMark = "strong" | "em" | "code";

/** The block kinds rich text is built from. Closed for the same reason the marks are. */
export type RichTextBlockKind = "paragraph" | "listItem";

/** A run of text and what is true of it. Inert: nothing here is parsed or evaluated at render. */
export interface RichTextSpan {
  text: string;
  marks?: readonly RichTextMark[];
  href?: string;
}

/** One block of a rich-text value: its kind, and the ordered spans it reads as. */
export interface RichTextBlock {
  kind: RichTextBlockKind;
  spans: readonly RichTextSpan[];
}

/** An ordered array of blocks — the whole value a `richText()` field holds. */
export type RichText = readonly RichTextBlock[];
