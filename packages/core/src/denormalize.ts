import type { ArtifactNode, ResolveNode } from "./artifact.types";
import { artifactNodeOf } from "./artifactNodeOf";
import type { DocumentVersion } from "./document.types";
import { slotEdges } from "./slotEdges";
import { wireSlots } from "./wireSlots";

/**
 * Resolves the flat `{root, elements}` index into a self-contained tree. `validateStructure`
 * has already proven the graph acyclic, fully reachable, and free of dangling references, so
 * this walk assumes all three — do not reintroduce those checks here.
 */
export function denormalize(version: DocumentVersion, resolve: ResolveNode): ArtifactNode[] {
  const pending: string[] = [version.root];
  const built = new Map<string, ArtifactNode>();
  while (pending.length > 0) {
    const id = pending.pop();
    if (id === undefined) break;
    const node = version.elements[id];
    if (built.has(id) || node === undefined) continue;
    built.set(id, artifactNodeOf(node, resolve));
    for (const edge of slotEdges(node)) {
      pending.push(edge.childId);
    }
  }
  wireSlots(version, built);
  const root = built.get(version.root);
  return root === undefined ? [] : [root];
}
