/** One parent-to-child slot reference, flattened for walking. */
export interface SlotEdge {
  slot: string;
  childId: string;
}

export type CycleState = "visiting" | "done";

/** One level of the iterative depth-first walk `findCycles` runs. */
export interface CycleFrame {
  id: string;
  edges: readonly SlotEdge[];
  next: number;
}
