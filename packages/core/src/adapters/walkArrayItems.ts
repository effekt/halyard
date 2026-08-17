import type { FieldNode } from "../field.types";
import { fieldNodeAt } from "./fieldNodeAt";
import { isJsonSchemaNode } from "./isJsonSchemaNode";
import type { JsonSchemaNode } from "./jsonSchema.types";
import { walkJsonSchema } from "./walkJsonSchema";

/** Emits the row shape at `path[]`, then the fields beneath it, so hints can target rows. */
export function walkArrayItems(arrayNode: JsonSchemaNode, path: string): FieldNode[] {
  if (!isJsonSchemaNode(arrayNode.items)) return [];
  const itemPath = `${path}[]`;
  return [
    fieldNodeAt(itemPath, arrayNode.items, false),
    ...walkJsonSchema(arrayNode.items, itemPath),
  ];
}
