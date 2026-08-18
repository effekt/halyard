import type { FieldHint } from "./catalog.types";

/**
 * A `data` hint turns its field into a hole resolved at render, and a hole addresses one
 * object field — `[]` names every member of an array, so it has no single target. The path
 * is real, which is why `label` and `control` stay legal on it; only `data` is refused, at
 * registration, where the developer who wrote the hint sees the error instead of a visitor.
 */
export function assertDataHintAddressable(
  blockName: string,
  fields: Record<string, FieldHint>,
): void {
  for (const [path, hint] of Object.entries(fields)) {
    if (hint.data !== undefined && path.includes("[]")) {
      throw new Error(
        `${blockName}: ui.fields["${path}"] sets \`data\`, but a hole cannot address ` +
          `an array member — "[]" has no single target`,
      );
    }
  }
}
