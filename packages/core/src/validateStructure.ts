import type { CompileIssue } from "./compileError.types";
import type { DocumentVersion } from "./document.types";
import { findCycles } from "./findCycles";
import { findDanglingChildren } from "./findDanglingChildren";
import { findRootIssues } from "./findRootIssues";
import { findSlotViolations } from "./findSlotViolations";
import { findUnknownBlocks } from "./findUnknownBlocks";
import { findUnreachable } from "./findUnreachable";
import type { Registry } from "./registry.types";

/**
 * Returns issues rather than throwing, so compile can report every structural problem in one
 * pass — an author fixing six dangling references should see six, not six sequential failures.
 */
export function validateStructure(version: DocumentVersion, registry: Registry): CompileIssue[] {
  const rootIssues = findRootIssues(version);
  // Without a root every element is unreachable, and those issues would bury the one cause.
  if (version.roots.length === 0) return rootIssues;
  return [
    ...findUnknownBlocks(version, registry),
    ...rootIssues,
    ...findDanglingChildren(version),
    ...findCycles(version),
    ...findUnreachable(version),
    ...findSlotViolations(version, registry),
  ];
}
