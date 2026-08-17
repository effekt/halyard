import type { ArtifactNode } from "./artifact.types";
import type { DocumentVersion } from "./document.types";

/** Second pass of denormalization: replaces child ids with the built nodes they name. */
export function wireSlots(version: DocumentVersion, built: Map<string, ArtifactNode>): void {
  for (const [id, artifactNode] of built) {
    const source = version.elements[id];
    if (source?.slots === undefined) continue;
    const slots: Record<string, ArtifactNode[]> = {};
    for (const [slotName, childIds] of Object.entries(source.slots)) {
      slots[slotName] = childIds.flatMap((childId) => {
        const child = built.get(childId);
        return child === undefined ? [] : [child];
      });
    }
    artifactNode.slots = slots;
  }
}
