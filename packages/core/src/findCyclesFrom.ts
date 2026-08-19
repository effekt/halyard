import type { CompileIssue } from "./compileError.types";
import type { DocumentVersion } from "./document.types";
import type { CycleFrame, CycleState } from "./graph.types";
import { pushCycleFrame } from "./pushCycleFrame";

/**
 * Iterative depth-first walk from one root carrying a visiting set — recursion risks a stack
 * overflow on a deep document and gives a worse error. The issue lands on the node holding
 * the back edge. `state` is the caller's, so it accumulates across roots.
 */
export function findCyclesFrom(
  version: DocumentVersion,
  root: string,
  state: Map<string, CycleState>,
): CompileIssue[] {
  const stack: CycleFrame[] = [];
  const issues: CompileIssue[] = [];
  pushCycleFrame(stack, state, version, root);
  while (stack.length > 0) {
    const frame = stack.at(-1);
    if (frame === undefined) break;
    const edge = frame.edges[frame.next];
    if (edge === undefined) {
      state.set(frame.id, "done");
      stack.pop();
      continue;
    }
    frame.next += 1;
    if (state.get(edge.childId) === "visiting") {
      issues.push({
        nodeId: frame.id,
        path: `slots.${edge.slot}`,
        code: "cycle",
        message: `"${frame.id}" reaches back to "${edge.childId}", so the graph cannot flatten into a tree`,
      });
    } else if (!state.has(edge.childId)) {
      pushCycleFrame(stack, state, version, edge.childId);
    }
  }
  return issues;
}
