import type { CompileIssue } from "./compileError.types";
import type { DocumentVersion, Node } from "./document.types";

/** Flags each child whose block the slot's allow list rejects. Dangling ids are another check's job. */
export function disallowedChildren(
  parent: Node,
  path: string,
  childIds: readonly string[],
  allow: readonly string[] | undefined,
  version: DocumentVersion,
): CompileIssue[] {
  if (allow === undefined) return [];
  const issues: CompileIssue[] = [];
  for (const childId of childIds) {
    const child = version.elements[childId];
    if (child === undefined || allow.includes(child.block)) continue;
    issues.push({
      nodeId: childId,
      path,
      code: "slot-not-allowed",
      message: `"${child.block}" is not allowed in ${path} of "${parent.block}"; allowed: ${allow.join(", ")}`,
    });
  }
  return issues;
}
