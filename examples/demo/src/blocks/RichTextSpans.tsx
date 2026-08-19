import type { RichTextSpan } from "@nubbin/core";
import { Fragment } from "react";
import { markedSpan } from "./markedSpan";

/** The spans of one block, in order. */
export function RichTextSpans({ spans }: { spans: readonly RichTextSpan[] }) {
  return (
    <>
      {spans.map((span, index) => (
        <Fragment key={`${index}:${span.text}`}>{markedSpan(span)}</Fragment>
      ))}
    </>
  );
}
