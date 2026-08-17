import type { CompileIssue } from "./compileError.types";
import type { DocumentVersion } from "./document.types";
import { slotEdges } from "./slotEdges";

/** A slot referencing an id with no element would silently vanish at denormalization. */
export function findDanglingChildren(version: DocumentVersion): CompileIssue[] {
  const issues: CompileIssue[] = [];
  if (version.elements[version.root] === undefined) {
    issues.push({
      nodeId: version.root,
      path: "root",
      code: "dangling-child",
      message: `root "${version.root}" has no matching element`,
    });
  }
  for (const node of Object.values(version.elements)) {
    for (const edge of slotEdges(node)) {
      if (version.elements[edge.childId] === undefined) {
        issues.push({
          nodeId: node.id,
          path: `slots.${edge.slot}`,
          code: "dangling-child",
          message: `child "${edge.childId}" has no matching element`,
        });
      }
    }
  }
  return issues;
}
