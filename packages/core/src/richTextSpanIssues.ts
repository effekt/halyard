import type { StandardSchemaV1 } from "@standard-schema/spec";
import { isUnknownProps } from "./isUnknownProps";
import { RICH_TEXT_SPAN_KEYS } from "./richText.constants";
import { richTextMarkIssues } from "./richTextMarkIssues";
import { unexpectedKeyIssues } from "./unexpectedKeyIssues";

/** Every reason a value is not a span, each addressed by the path the studio would highlight. */
export function richTextSpanIssues(value: unknown): StandardSchemaV1.Issue[] {
  if (!isUnknownProps(value)) return [{ message: "a span must be an object", path: [] }];
  const issues: StandardSchemaV1.Issue[] = [];
  if (typeof value.text !== "string") {
    issues.push({ message: "text must be a string", path: ["text"] });
  }
  issues.push(...richTextMarkIssues(value.marks));
  if (value.href !== undefined && typeof value.href !== "string") {
    issues.push({ message: "href must be a string", path: ["href"] });
  }
  issues.push(...unexpectedKeyIssues(value, RICH_TEXT_SPAN_KEYS));
  return issues;
}
