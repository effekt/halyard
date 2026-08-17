import type { Artifact } from "./artifact.types";
import type { Registry } from "./registry.types";
import type { RollbackCheck } from "./rollback.types";

/**
 * Compares what the artifact was compiled against with the registry live now. A name the
 * registry no longer holds is drift, not an absent check — a deleted block is exactly the
 * failure a rollback must be warned about.
 */
export function checkRollback(artifact: Artifact, registry: Registry): RollbackCheck {
  const drifted = Object.entries(artifact.blockVersions)
    .filter(([name, version]) => registry.get(name)?.version !== version)
    .map(([name]) => name);
  return drifted.length === 0 ? { compatible: true } : { compatible: false, drifted };
}
