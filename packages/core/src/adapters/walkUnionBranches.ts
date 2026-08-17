import type { FieldNode } from "../field.types";
import { isJsonSchemaNode } from "./isJsonSchemaNode";
import type { JsonSchemaNode } from "./jsonSchema.types";
import { walkJsonSchema } from "./walkJsonSchema";

/** Emits the fields of every branch under the union's own path, so hints reach branch fields. */
export function walkUnionBranches(unionNode: JsonSchemaNode, path: string): FieldNode[] {
  const branches = [unionNode.oneOf, unionNode.anyOf].filter(Array.isArray).flat();
  return branches.flatMap((branch) =>
    isJsonSchemaNode(branch) ? walkJsonSchema(branch, path) : [],
  );
}
