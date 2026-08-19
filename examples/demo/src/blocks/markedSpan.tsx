import type { RichTextSpan } from "@nubbin/core";
import { createElement, type ReactNode } from "react";

/** Mark name to element. A closed map, so nothing an author types chooses a tag. */
const MARK_ELEMENT = { strong: "strong", em: "em", code: "code" } as const;

/**
 * One span as nodes: its text wrapped once per mark, then linked if it carries an href. The
 * value is data throughout — no string is parsed and no markup is interpreted.
 */
export function markedSpan(span: RichTextSpan): ReactNode {
  const marked = (span.marks ?? []).reduce<ReactNode>(
    (node, mark) => createElement(MARK_ELEMENT[mark], null, node),
    span.text,
  );
  if (span.href === undefined) return marked;
  return (
    <a href={span.href} className="underline">
      {marked}
    </a>
  );
}
