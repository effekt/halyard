import type { CompileIssue } from "./compileError.types";
import type { DocumentVersion } from "./document.types";
import { reachableIds } from "./reachableIds";

/** A node no slot reaches would be dropped silently by denormalization, so it is an error here. */
export function findUnreachable(version: DocumentVersion): CompileIssue[] {
  const reached = reachableIds(version);
  const issues: CompileIssue[] = [];
  for (const node of Object.values(version.elements)) {
    if (reached.has(node.id)) continue;
    issues.push({
      nodeId: node.id,
      path: "",
      code: "unreachable",
      message: `no slot reaches "${node.id}" from the root`,
    });
  }
  return issues;
}
