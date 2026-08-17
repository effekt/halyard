import type { Block } from "./block.types";
import { unknownAllowEntries } from "./unknownAllowEntries";

/**
 * An `allow` entry matching no registered block is silent and inverted: the slot rejects every
 * child forever, including the one the author meant. Every entry is reported at once, because a
 * report that stops at the first typo costs a second round trip.
 */
export function assertSlotAllows(blocks: readonly Block[]): void {
  const known = new Set(blocks.map((block) => block.name));
  const unresolved = blocks.flatMap((block) => unknownAllowEntries(block, known));
  if (unresolved.length > 0) {
    throw new Error(
      `Slot allow lists name ${unresolved.join(", ")}, which no registered block defines. ` +
        `Registered blocks: ${[...known].sort().join(", ")}`,
    );
  }
}
