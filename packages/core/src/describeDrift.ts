import type { Artifact } from "./artifact.types";
import type { BlockDrift } from "./compatibility.types";
import type { Registry } from "./registry.types";

/**
 * Turns the names `checkRollback` reports into the delta a reader can act on: what the live
 * artifact needs against what is registered now, with `null` for a block the registry has lost.
 * The names come from the artifact's own `blockVersions`, so a key that is somehow absent is
 * dropped rather than reported at a made-up version.
 */
export function describeDrift(
  artifact: Artifact,
  registry: Registry,
  drifted: readonly string[],
): BlockDrift[] {
  return drifted.flatMap((block) => {
    const live = artifact.blockVersions[block];
    return live === undefined
      ? []
      : [{ block, live, registered: registry.get(block)?.version ?? null }];
  });
}
