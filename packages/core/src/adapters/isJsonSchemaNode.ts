import type { JsonSchemaNode } from "./jsonSchema.types";

/** Narrows a raw JSON Schema value to a node the walker can read keys from. */
export function isJsonSchemaNode(value: unknown): value is JsonSchemaNode {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
