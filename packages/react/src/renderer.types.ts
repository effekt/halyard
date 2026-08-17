import type { Artifact } from "@nubbin/core";
import type { HoleResolver } from "./holes.types";
import type { BlockComponent, BlockRegistry } from "./registry.types";

/**
 * `resolveHole` is written `?: HoleResolver | undefined` rather than `?: HoleResolver` because
 * `exactOptionalPropertyTypes` is on: destructuring an absent optional yields `undefined`, and
 * `Renderer` assigns exactly that into `RenderContext`. Callers that omit it still typecheck.
 */
export interface RendererProps {
  artifact: Artifact;
  registry: BlockRegistry;
  resolveHole?: HoleResolver | undefined;
}

/** What the walk carries down: the route a hole resolves against, and the loaded blocks. */
export interface RenderContext {
  route: string;
  blocks: Record<string, BlockComponent>;
  resolveHole?: HoleResolver | undefined;
}
