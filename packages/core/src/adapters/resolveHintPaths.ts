import { zodAdapter } from "./zodAdapter";

/**
 * A hint keyed to a path the schema does not have is invisible at runtime: the inspector falls
 * back to default treatment and renders something plausible. Registration is the only moment
 * this is detectable, so it throws here rather than degrading later.
 */
export function resolveHintPaths(
  blockName: string,
  schema: unknown,
  fields: Record<string, unknown>,
): void {
  const known = new Set(zodAdapter.describe(schema).map((field) => field.path));
  const unresolved = Object.keys(fields).filter((path) => !known.has(path));
  if (unresolved.length > 0) {
    throw new Error(
      `${blockName}: ui.fields references ${unresolved.map((p) => `"${p}"`).join(", ")}, ` +
        `which the schema does not define. Known paths: ${[...known].join(", ")}`,
    );
  }
}
