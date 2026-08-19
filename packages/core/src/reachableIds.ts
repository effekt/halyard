import type { DocumentVersion } from "./document.types";
import { slotEdges } from "./slotEdges";

/** Every id a slot walk from the roots can reach, whether or not an element backs it. */
export function reachableIds(version: DocumentVersion): Set<string> {
  const seen = new Set<string>(version.roots);
  const queue: string[] = [...version.roots];
  while (queue.length > 0) {
    const id = queue.pop();
    const node = id === undefined ? undefined : version.elements[id];
    if (node === undefined) continue;
    for (const edge of slotEdges(node)) {
      if (seen.has(edge.childId)) continue;
      seen.add(edge.childId);
      queue.push(edge.childId);
    }
  }
  return seen;
}
