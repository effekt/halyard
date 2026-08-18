import type { BlockDrift } from "./compatibility.types";

/**
 * One line naming the block and both versions. A removed block reads as removed rather than as
 * a version of `null`, because deletion is the case the guardrail exists for and a reader
 * skimming a CI log has to see it without decoding a placeholder.
 */
export function formatBlockDrift(drift: BlockDrift): string {
  return drift.registered === null
    ? `${drift.block}: page needs v${drift.live}, no longer in the registry`
    : `${drift.block}: page needs v${drift.live}, registry has v${drift.registered}`;
}
