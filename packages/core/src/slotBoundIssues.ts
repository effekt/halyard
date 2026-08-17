import type { SlotConstraint } from "./block.types";
import type { CompileIssue } from "./compileError.types";

/** Checks a slot's occupancy against its declared bounds, driven by data so min and max share one shape. */
export function slotBoundIssues(
  parentId: string,
  path: string,
  count: number,
  constraint: SlotConstraint,
): CompileIssue[] {
  const { min, max } = constraint;
  const bounds = [
    {
      code: "slot-min" as const,
      limit: min,
      breached: min !== undefined && count < min,
      sense: "at least",
    },
    {
      code: "slot-max" as const,
      limit: max,
      breached: max !== undefined && count > max,
      sense: "at most",
    },
  ];
  return bounds
    .filter((bound) => bound.breached)
    .map((bound) => ({
      nodeId: parentId,
      path,
      code: bound.code,
      message: `${path} holds ${count} of ${bound.sense} ${bound.limit}`,
    }));
}
