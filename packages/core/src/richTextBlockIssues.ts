import type { StandardSchemaV1 } from "@standard-schema/spec";
import { isRichTextBlockKind } from "./isRichTextBlockKind";
import { isUnknownProps } from "./isUnknownProps";
import { nestedSchemaIssues } from "./nestedSchemaIssues";
import { RICH_TEXT_BLOCK_KEYS, RICH_TEXT_BLOCK_KINDS } from "./richText.constants";
import { richTextSpanSchema } from "./richTextSpanSchema";
import { unexpectedKeyIssues } from "./unexpectedKeyIssues";

/** Every reason a value is not a block. Its spans are validated by the span schema itself, so
 * the two shapes cannot drift apart. */
export function richTextBlockIssues(value: unknown): StandardSchemaV1.Issue[] {
  if (!isUnknownProps(value)) return [{ message: "a block must be an object", path: [] }];
  const issues: StandardSchemaV1.Issue[] = [];
  if (!isRichTextBlockKind(value.kind)) {
    issues.push({
      message: `unknown kind ${JSON.stringify(value.kind)}; expected one of ${RICH_TEXT_BLOCK_KINDS.join(", ")}`,
      path: ["kind"],
    });
  }
  if (Array.isArray(value.spans)) {
    issues.push(
      ...value.spans.flatMap((span: unknown, index: number) =>
        nestedSchemaIssues(richTextSpanSchema, span, ["spans", index]),
      ),
    );
  } else {
    issues.push({ message: "spans must be an array", path: ["spans"] });
  }
  issues.push(...unexpectedKeyIssues(value, RICH_TEXT_BLOCK_KEYS));
  return issues;
}
