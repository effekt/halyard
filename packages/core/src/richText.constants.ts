/** The closed mark set, in the order an editor would offer it. */
export const RICH_TEXT_MARKS = ["strong", "em", "code"] as const;

/** The closed block-kind set. */
export const RICH_TEXT_BLOCK_KINDS = ["paragraph", "listItem"] as const;

/** Every key a span may carry; anything else is refused rather than dropped. */
export const RICH_TEXT_SPAN_KEYS = ["text", "marks", "href"] as const;

/** Every key a block may carry. */
export const RICH_TEXT_BLOCK_KEYS = ["kind", "spans"] as const;
