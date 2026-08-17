import type { FieldHintData } from "@nubbin/core";

export interface HoleContext {
  route: string;
  nodeId: string;
  block: string;
  path: string;
  /** `"request"` or `{ revalidate: n }` — exactly what compile wrote into the artifact. */
  spec: FieldHintData;
}

/**
 * Supplied by the consumer. The renderer decides where a value lands; the resolver decides
 * what it is. It receives the spec and never a value — the stored placeholder was dropped at
 * compile, and mapping a lifecycle onto a caching layer belongs to the framework binding.
 */
export type HoleResolver = (context: HoleContext) => Promise<unknown>;
