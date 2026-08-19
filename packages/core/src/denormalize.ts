import type { ArtifactNode, ResolveNode } from "./artifact.types";
import { artifactNodeOf } from "./artifactNodeOf";
import type { DocumentVersion } from "./document.types";
import { slotEdges } from "./slotEdges";
import { wireSlots } from "./wireSlots";

/**
 * Resolves the flat `{roots, elements}` index into one self-contained tree per root, in the
 * order `roots` names them. `validateStructure` has already proven the graph acyclic, fully
 * reachable, and free of dangling references, so this walk assumes all three — do not
 * reintroduce those checks here.
 */
export function denormalize(version: DocumentVersion, resolve: ResolveNode): ArtifactNode[] {
  const pending: string[] = [...version.roots];
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
  return version.roots.flatMap((id) => {
    const root = built.get(id);
    return root === undefined ? [] : [root];
  });
}
