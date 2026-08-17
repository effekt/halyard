import type { CompileIssue } from "./compileError.types";
import type { DocumentVersion } from "./document.types";
import type { Registry } from "./registry.types";

/** A node naming a block the registry lacks can never resolve to a component. */
export function findUnknownBlocks(version: DocumentVersion, registry: Registry): CompileIssue[] {
  return Object.values(version.elements)
    .filter((node) => registry.get(node.block) === undefined)
    .map((node) => ({
      nodeId: node.id,
      path: "block",
      code: "unknown-block" as const,
      message: `"${node.block}" is not a registered block`,
    }));
}
