import type { BlockComponent, BlockRegistry } from "./registry.types";

/**
 * Resolves only the named importers, in parallel. The unnamed rest of the registry is never
 * touched — that, plus one chunk per importer, is why the hundredth block costs this route
 * nothing.
 *
 * Every missing name is reported at once: an artifact compiled against a registry the app has
 * since shrunk needs each name fixed separately, so failing on the first hides the work.
 */
export async function loadBlocks(
  registry: BlockRegistry,
  names: readonly string[],
): Promise<Record<string, BlockComponent>> {
  const missing = names.filter((name) => registry[name] === undefined);
  if (missing.length > 0) {
    throw new Error(`registry has no importer for: ${missing.join(", ")}`);
  }
  const wanted = new Set(names);
  const loaded = await Promise.all(
    Object.entries(registry)
      .filter(([name]) => wanted.has(name))
      .map(async ([name, importer]) => [name, await importer()] as const),
  );
  // `BlockRegistry` stores `BlockComponent<never>` so that a component reading its own props can
  // be put in one at all — parameters are contravariant. Widening back is sound at the render
  // seam and nowhere else: what reaches a component here are props compile already validated
  // against that block's schema.
  return Object.fromEntries(loaded) as Record<string, BlockComponent>;
}
