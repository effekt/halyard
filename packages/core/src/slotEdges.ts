import type { Node } from "./document.types";
import type { SlotEdge } from "./graph.types";

/** Flattens a node's slots into one edge list, so walkers loop once instead of twice. */
export function slotEdges(node: Node): SlotEdge[] {
  const edges: SlotEdge[] = [];
  for (const [slot, children] of Object.entries(node.slots ?? {})) {
    for (const childId of children) {
      edges.push({ slot, childId });
    }
  }
  return edges;
}
