import type { FieldNode } from "../field.types";
import type { JsonSchemaNode } from "./jsonSchema.types";
import { kindOfJsonSchema } from "./kindOfJsonSchema";

/** Builds the FieldNode for one schema node, attaching members only when the kind is enum. */
export function fieldNodeAt(path: string, node: JsonSchemaNode, optional: boolean): FieldNode {
  const kind = kindOfJsonSchema(node);
  if (kind === "enum" && Array.isArray(node.enum)) {
    return { path, kind, optional, members: node.enum.map(String) };
  }
  return { path, kind, optional };
}
