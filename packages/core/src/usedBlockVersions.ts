import type { DocumentVersion } from "./document.types";
import type { Registry } from "./registry.types";

/**
 * Only the blocks the document names — a route loads what its artifact lists, so naming
 * unused blocks would load them too.
 */
export function usedBlockVersions(
  version: DocumentVersion,
  registry: Registry,
): Record<string, number> {
  const versions: Record<string, number> = {};
  for (const node of Object.values(version.elements)) {
    const block = registry.get(node.block);
    if (block !== undefined) {
      versions[node.block] = block.version;
    }
  }
  return versions;
}
