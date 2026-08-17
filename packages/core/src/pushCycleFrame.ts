import type { DocumentVersion } from "./document.types";
import type { CycleFrame, CycleState } from "./graph.types";
import { slotEdges } from "./slotEdges";

/** Opens one node in the depth-first walk: marks it visiting and stacks its edges. */
export function pushCycleFrame(
  stack: CycleFrame[],
  state: Map<string, CycleState>,
  version: DocumentVersion,
  id: string,
): void {
  const node = version.elements[id];
  if (node === undefined) return;
  state.set(id, "visiting");
  stack.push({ id, edges: slotEdges(node), next: 0 });
}
