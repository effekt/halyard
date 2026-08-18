import type { Artifact, RoutePointer } from "./artifact.types";

/** One route pointer and the artifact it names, as an adapter read them. */
export interface LiveRoute {
  pointer: RoutePointer;
  /** `null` when the store holds no artifact at the pointer's hash — a pointer into nothing. */
  artifact: Artifact | null;
}

/** One block's version delta between what a live artifact needs and what is registered now. */
export interface BlockDrift {
  block: string;
  /** The version the artifact was compiled against. */
  live: number;
  /** The version registered now — `null` when the registry no longer holds the block at all. */
  registered: number | null;
}

/**
 * Why one live route would not render. `unreadable-artifact` is a pointer whose hash the store
 * cannot resolve, which breaks the route without any registry change at all.
 */
export type RouteIncompatibility =
  | { route: string; hash: string; reason: "unreadable-artifact" }
  | { route: string; hash: string; reason: "block-drift"; drifted: BlockDrift[] };

/** The verdict over every live pointer. `checked` is reported so a run over nothing cannot read as a pass. */
export interface CompatibilityReport {
  checked: number;
  compatible: boolean;
  incompatible: RouteIncompatibility[];
}
