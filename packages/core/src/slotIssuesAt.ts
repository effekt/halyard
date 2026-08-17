import type { SlotConstraint } from "./block.types";
import type { CompileIssue } from "./compileError.types";
import { disallowedChildren } from "./disallowedChildren";
import type { DocumentVersion, Node } from "./document.types";
import { slotBoundIssues } from "./slotBoundIssues";

/** Checks one filled slot against its declared constraint: existence, bounds, and allow list. */
export function slotIssuesAt(
  parent: Node,
  slotName: string,
  childIds: readonly string[],
  constraint: SlotConstraint | undefined,
  version: DocumentVersion,
): CompileIssue[] {
  const path = `slots.${slotName}`;
  if (constraint === undefined) {
    return [
      {
        nodeId: parent.id,
        path,
        code: "slot-not-allowed",
        message: `"${parent.block}" declares no slot "${slotName}"`,
      },
    ];
  }
  return [
    ...slotBoundIssues(parent.id, path, childIds.length, constraint),
    ...disallowedChildren(parent, path, childIds, constraint.allow, version),
  ];
}
