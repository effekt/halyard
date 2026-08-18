import type { UnknownProps } from "@nubbin/core";

/** Reads the value beneath one dotted path — `undefined` for anything unset, and for an
 * `items[]` segment, which names every member rather than one. */
export function valueAtPath(props: UnknownProps, path: string): unknown {
  let current: unknown = props;
  for (const segment of path.split(".")) {
    if (typeof current !== "object" || current === null) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}
