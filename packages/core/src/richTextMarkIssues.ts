import type { StandardSchemaV1 } from "@standard-schema/spec";
import { isRichTextMark } from "./isRichTextMark";
import { RICH_TEXT_MARKS } from "./richText.constants";

/** Every reason a span's `marks` is not a list drawn from the closed set. Absent is legal. */
export function richTextMarkIssues(marks: unknown): StandardSchemaV1.Issue[] {
  if (marks === undefined) return [];
  if (!Array.isArray(marks)) return [{ message: "marks must be an array", path: ["marks"] }];
  return marks.flatMap((mark: unknown, index: number) =>
    isRichTextMark(mark)
      ? []
      : [
          {
            message: `unknown mark ${JSON.stringify(mark)}; expected one of ${RICH_TEXT_MARKS.join(", ")}`,
            path: ["marks", index],
          },
        ],
  );
}
