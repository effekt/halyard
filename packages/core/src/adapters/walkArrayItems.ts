import type { FieldNode } from "../field.types";
import { fieldNodeAt } from "./fieldNodeAt";
import { isJsonSchemaNode } from "./isJsonSchemaNode";
import type { Descend, JsonSchemaNode } from "./jsonSchema.types";

/** Emits the row shape at `path[]`, then the fields beneath it, so hints can target rows. */
export function walkArrayItems(
  arrayNode: JsonSchemaNode,
  path: string,
  descend: Descend,
): FieldNode[] {
  if (!isJsonSchemaNode(arrayNode.items)) return [];
  const itemPath = `${path}[]`;
  return [fieldNodeAt(itemPath, arrayNode.items, false), ...descend(arrayNode.items, itemPath)];
}
