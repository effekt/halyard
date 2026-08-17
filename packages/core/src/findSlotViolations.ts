import type { CompileIssue } from "./compileError.types";
import type { DocumentVersion } from "./document.types";
import type { Registry } from "./registry.types";
import { slotIssuesAt } from "./slotIssuesAt";

/**
 * Checks the union of declared and filled slot names, so a required slot a node omits
 * entirely is caught as surely as one filled below min. Unknown blocks are skipped — that
 * is another check's finding.
 */
export function findSlotViolations(version: DocumentVersion, registry: Registry): CompileIssue[] {
  return Object.values(version.elements).flatMap((node) => {
    const block = registry.get(node.block);
    if (block === undefined) return [];
    const filled = node.slots ?? {};
    const names = new Set([...Object.keys(block.slots), ...Object.keys(filled)]);
    return [...names].flatMap((slotName) =>
      slotIssuesAt(node, slotName, filled[slotName] ?? [], block.slots[slotName], version),
    );
  });
}
