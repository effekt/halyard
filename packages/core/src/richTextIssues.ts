import type { StandardSchemaV1 } from "@standard-schema/spec";
import { nestedSchemaIssues } from "./nestedSchemaIssues";
import { richTextBlockSchema } from "./richTextBlockSchema";

/** Every reason a value is not rich text, delegating each block to the block schema. */
export function richTextIssues(value: unknown): StandardSchemaV1.Issue[] {
  if (!Array.isArray(value)) {
    return [{ message: "rich text must be an array of blocks", path: [] }];
  }
  return value.flatMap((block: unknown, index: number) =>
    nestedSchemaIssues(richTextBlockSchema, block, [index]),
  );
}
