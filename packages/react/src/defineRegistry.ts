import type { BlockRegistry } from "./registry.types";

/**
 * Identity at runtime. The call site's object literal is the point: each value is an `import()`
 * the bundler can see statically, which is what per-block code-splitting rests on.
 *
 * `R` is returned rather than `BlockRegistry` so the map keeps its exact keys where it is
 * written. Indexing the widened form by an arbitrary string is the renderer's problem, and the
 * renderer takes `BlockRegistry` for exactly that reason.
 */
export function defineRegistry<R extends BlockRegistry>(registry: R): R {
  return registry;
}
