import type { FieldNode } from "../field.types";
import type { JsonSchemaNode } from "./jsonSchema.types";
import { kindOfJsonSchema } from "./kindOfJsonSchema";
import { walkArrayItems } from "./walkArrayItems";
import { walkObjectProperties } from "./walkObjectProperties";
import { walkUnionBranches } from "./walkUnionBranches";

/**
 * Emits the fields beneath one JSON Schema node. The node itself is emitted by its parent, so
 * calling this on the schema root yields exactly the addressable paths — the root has no path.
 */
export function walkJsonSchema(node: JsonSchemaNode, basePath: string): FieldNode[] {
  const kind = kindOfJsonSchema(node);
  if (kind === "object") return walkObjectProperties(node, basePath, walkJsonSchema);
  if (kind === "array") return walkArrayItems(node, basePath, walkJsonSchema);
  if (kind === "union") return walkUnionBranches(node, basePath, walkJsonSchema);
  return [];
}
