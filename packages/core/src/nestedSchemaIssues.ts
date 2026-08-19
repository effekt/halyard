import type { StandardSchemaV1 } from "@standard-schema/spec";
import { standardValidate } from "./standardValidate";

/**
 * Validates one nested value against its own schema and re-addresses whatever it rejected
 * against the parent's path, so a rejection deep inside a rich-text value still names the field
 * an editing surface would highlight.
 */
export function nestedSchemaIssues(
  schema: unknown,
  value: unknown,
  prefix: readonly PropertyKey[],
): StandardSchemaV1.Issue[] {
  const result = standardValidate(schema, value);
  if (result.issues === undefined) return [];
  return result.issues.map((issue) => ({
    message: issue.message,
    path: [...prefix, ...(issue.path ?? [])],
  }));
}
