import type { FieldNode } from "../field.types";
import { isJsonSchemaNode } from "./isJsonSchemaNode";
import type { Descend, JsonSchemaNode } from "./jsonSchema.types";

/** Emits the fields of every branch under the union's own path, so hints reach branch fields. */
export function walkUnionBranches(
  unionNode: JsonSchemaNode,
  path: string,
  descend: Descend,
): FieldNode[] {
  const branches = [unionNode.oneOf, unionNode.anyOf].filter(Array.isArray).flat();
  return branches.flatMap((branch) => (isJsonSchemaNode(branch) ? descend(branch, path) : []));
}
