import type { Holes } from "./artifact.types";
import type { UnknownProps } from "./block.types";
import type { Catalog } from "./catalog.types";
import type { CompileIssue } from "./compileError.types";
import type { DocumentVersion } from "./document.types";
import { partitionProps } from "./partitionProps";
import { validateNodeProps } from "./validateNodeProps";

/**
 * Validates and partitions every node's props in one pass, collecting issues instead of
 * stopping at the first, so compile can report them all together.
 */
export function resolveAllProps(
  version: DocumentVersion,
  catalog: Catalog,
): { resolved: Map<string, { props: UnknownProps; holes: Holes }>; issues: CompileIssue[] } {
  const resolved = new Map<string, { props: UnknownProps; holes: Holes }>();
  const issues: CompileIssue[] = [];
  for (const node of Object.values(version.elements)) {
    const entry = catalog[node.block];
    if (entry === undefined) {
      const message = `"${node.block}" has no catalog entry, so its props cannot be validated`;
      issues.push({ code: "unknown-block", message, nodeId: node.id, path: "block" });
      continue;
    }
    const { value, issues: propIssues } = validateNodeProps(node, entry.schema);
    issues.push(...propIssues);
    if (value !== undefined) {
      resolved.set(node.id, partitionProps(value, entry.ui));
    }
  }
  return { resolved, issues };
}
