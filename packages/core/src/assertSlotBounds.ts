import type { SlotConstraint } from "./block.types";

/** A slot whose min exceeds its max is one no composition could satisfy. */
export function assertSlotBounds(name: string, slots: Record<string, SlotConstraint>): void {
  for (const [slot, { min, max }] of Object.entries(slots)) {
    if (min !== undefined && max !== undefined && min > max) {
      throw new Error(`${name}: slot "${slot}" has min ${min} above max ${max}`);
    }
  }
}
