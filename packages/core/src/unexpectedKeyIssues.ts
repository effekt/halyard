import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { UnknownProps } from "./block.types";

/**
 * One issue per key the shape does not declare. A closed shape is what stops markup arriving as
 * an extra field the schema cannot see; silently dropping the key would hide the same content.
 */
export function unexpectedKeyIssues(
  value: UnknownProps,
  allowed: readonly string[],
): StandardSchemaV1.Issue[] {
  return Object.keys(value)
    .filter((key) => !allowed.includes(key))
    .map((key) => ({ message: `unexpected key "${key}"`, path: [key] }));
}
