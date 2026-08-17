import type { Block } from "./block.types";

/** Every `allow` entry on this block that `known` does not resolve, quoted with its slot. */
export function unknownAllowEntries(block: Block, known: ReadonlySet<string>): string[] {
  return Object.entries(block.slots).flatMap(([slot, constraint]) =>
    (constraint.allow ?? [])
      .filter((allowed) => !known.has(allowed))
      .map((allowed) => `"${allowed}" (${block.name}.${slot})`),
  );
}
