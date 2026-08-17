import type { FieldNode } from "../field.types";
import { fieldNodeAt } from "./fieldNodeAt";
import { isJsonSchemaNode } from "./isJsonSchemaNode";
import type { JsonSchemaNode } from "./jsonSchema.types";
import { walkJsonSchema } from "./walkJsonSchema";

/** Emits one field per property, then the fields beneath it, using dotted paths. */
export function walkObjectProperties(objectNode: JsonSchemaNode, basePath: string): FieldNode[] {
  const { properties, required } = objectNode;
  if (!isJsonSchemaNode(properties)) return [];
  const requiredNames: readonly unknown[] = Array.isArray(required) ? required : [];
  const fields: FieldNode[] = [];
  for (const [name, child] of Object.entries(properties)) {
    if (!isJsonSchemaNode(child)) continue;
    const path = basePath === "" ? name : `${basePath}.${name}`;
    fields.push(fieldNodeAt(path, child, !requiredNames.includes(name)));
    fields.push(...walkJsonSchema(child, path));
  }
  return fields;
}
