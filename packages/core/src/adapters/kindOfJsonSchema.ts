import type { FieldKind } from "../field.types";
import type { JsonSchemaNode } from "./jsonSchema.types";

/** Maps one JSON Schema node to the field kind the studio renders it as. */
export function kindOfJsonSchema(node: JsonSchemaNode): FieldKind {
  if (Array.isArray(node.enum)) return "enum";
  if (Array.isArray(node.oneOf) || Array.isArray(node.anyOf)) return "union";
  switch (node.type) {
    case "string":
      return "string";
    case "number":
    case "integer":
      return "number";
    case "boolean":
      return "boolean";
    case "array":
      return "array";
    case "object":
      return "object";
    default:
      return "unknown";
  }
}
