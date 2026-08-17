import type { CompileIssue } from "./compileError.types";
import type { DocumentVersion } from "./document.types";
import type { Registry } from "./registry.types";
import { slotIssuesAt } from "./slotIssuesAt";

/** Checks every filled slot against the block's declared constraints. Unknown blocks are skipped — that is another check's finding. */
export function findSlotViolations(version: DocumentVersion, registry: Registry): CompileIssue[] {
  return Object.values(version.elements).flatMap((node) => {
    const block = registry.get(node.block);
    if (block === undefined) return [];
    return Object.entries(node.slots ?? {}).flatMap(([slotName, childIds]) =>
      slotIssuesAt(node, slotName, childIds, block.slots[slotName], version),
    );
  });
}
