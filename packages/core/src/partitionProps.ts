import type { UnknownProps } from "./block.types";
import type { BlockUi, FieldHintData } from "./catalog.types";

/**
 * Splits validated props by `ui.fields[key].data`: absent means static and the value freezes
 * into `props`; `request` or `{ revalidate }` means the value is discarded and a hole records
 * how the field resolves at render. Walking the validated value's own keys keeps the invariant
 * that every prop lands in exactly one of the two — a hint naming a key the value does not
 * have is unreachable after registration (#35) and is ignored here rather than invented.
 */
export function partitionProps(
  validated: UnknownProps,
  hints: BlockUi | undefined,
): { props: UnknownProps; holes: Record<string, FieldHintData> } {
  const props: UnknownProps = {};
  const holes: Record<string, FieldHintData> = {};
  const fields = hints?.fields ?? {};
  for (const [key, value] of Object.entries(validated)) {
    const data = fields[key]?.data;
    if (data === undefined) {
      props[key] = value;
    } else {
      holes[key] = data;
    }
  }
  return { props, holes };
}
