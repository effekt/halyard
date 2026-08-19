import type { FieldHint } from "./catalog.types";

/**
 * A `data` hint turns its field into a hole resolved at render, and a hole addresses one
 * object field — `[]` names every member of an array, so it has no single target. A dotted
 * path is legal: `cta.label` is one object field, and the compiler takes that leaf alone.
 *
 * Two `data` hints whose paths nest are refused for the same reason: a hole over `cta` and a
 * hole over `cta.label` write to one value with no defined order of application. Both checks
 * run at registration, where the developer who wrote the hint sees the error instead of a
 * visitor.
 */
export function assertDataHintAddressable(
  blockName: string,
  fields: Record<string, FieldHint>,
): void {
  const seen: string[] = [];
  for (const [path, hint] of Object.entries(fields)) {
    if (hint.data === undefined) continue;
    if (path.includes("[]")) {
      throw new Error(
        `${blockName}: ui.fields["${path}"] sets \`data\`, but a hole cannot address ` +
          `an array member — "[]" has no single target`,
      );
    }
    const nested = seen.find(
      (other) => path.startsWith(`${other}.`) || other.startsWith(`${path}.`),
    );
    if (nested !== undefined) {
      throw new Error(
        `${blockName}: ui.fields["${nested}"] and ui.fields["${path}"] both set \`data\`, but ` +
          `their paths overlap — two holes over one value have no defined order of application`,
      );
    }
    seen.push(path);
  }
}
