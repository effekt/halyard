import type { FieldNode } from "@nubbin/core";

const EDITABLE_KINDS = new Set(["string", "number", "boolean", "enum"]);

/**
 * The kinds this slice commits from a single control. `array`, `object`, `union` and
 * `unknown` render read-only, and an `items[].title` path names every member rather than
 * one, so it has no single control either.
 */
export function isEditableField(field: Pick<FieldNode, "kind" | "path">): boolean {
  return EDITABLE_KINDS.has(field.kind) && !field.path.includes("[]");
}
