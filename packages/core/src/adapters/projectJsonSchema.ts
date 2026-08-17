import { isStandardJsonSchemaCapable } from "./isStandardJsonSchemaCapable";
import type { JsonSchemaNode } from "./jsonSchema.types";

const OPTIONS = {
  target: "draft-2020-12",
  /** zod's option name: a type JSON Schema cannot express throws here, at registration. */
  libraryOptions: { unrepresentable: "throw" },
} as const;

/**
 * Projects a schema to JSON Schema through the Standard JSON Schema converter. The converter
 * throws on a type it cannot represent, so an unrepresentable field fails loudly at registration
 * instead of degrading to a string field.
 */
export function projectJsonSchema(schema: unknown): JsonSchemaNode {
  if (!isStandardJsonSchemaCapable(schema)) {
    throw new Error("Schema does not expose the Standard JSON Schema converter (spec >= 1.1)");
  }
  return schema["~standard"].jsonSchema.input(OPTIONS);
}
