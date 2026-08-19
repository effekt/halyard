import type { UnknownProps } from "./block.types";
import type { BlockUi, FieldHintData } from "./catalog.types";
import { takeAtPath } from "./takeAtPath";

/**
 * Splits validated props by `ui.fields[path].data`: absent means static and the value freezes
 * into `props`; `request` or `{ revalidate }` means the value is discarded and a hole records
 * how the field resolves at render. The split is by the full dotted path the hint names, so
 * `cta.label` takes that one leaf and the rest of `cta` stays frozen — the same vocabulary
 * `setAtPath` uses to fill the hole back in at render. Iterating hint paths rather than value
 * keys is what makes a nested hint reachable; a hint naming a path the value does not carry
 * takes nothing and is ignored here rather than invented.
 */
export function partitionProps(
  validated: UnknownProps,
  hints: BlockUi | undefined,
): { props: UnknownProps; holes: Record<string, FieldHintData> } {
  let props: UnknownProps = { ...validated };
  const holes: Record<string, FieldHintData> = {};
  for (const [path, hint] of Object.entries(hints?.fields ?? {})) {
    if (hint.data === undefined) continue;
    const { rest, taken } = takeAtPath(props, path);
    if (!taken) continue;
    props = rest;
    holes[path] = hint.data;
  }
  return { props, holes };
}
