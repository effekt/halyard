import type { CompileIssue } from "./compileError.types";
import type { DocumentVersion } from "./document.types";
import { findCycles } from "./findCycles";
import { findDanglingChildren } from "./findDanglingChildren";
import { findSlotViolations } from "./findSlotViolations";
import { findUnknownBlocks } from "./findUnknownBlocks";
import { findUnreachable } from "./findUnreachable";
import type { Registry } from "./registry.types";

/**
 * Returns issues rather than throwing, so compile can report every structural problem in one
 * pass — an author fixing six dangling references should see six, not six sequential failures.
 */
export function validateStructure(version: DocumentVersion, registry: Registry): CompileIssue[] {
  return [
    ...findUnknownBlocks(version, registry),
    ...findDanglingChildren(version),
    ...findCycles(version),
    ...findUnreachable(version),
    ...findSlotViolations(version, registry),
  ];
}
