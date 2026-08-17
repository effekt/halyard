import { assertSlotAllows } from "./assertSlotAllows";
import type { Block } from "./block.types";
import { fnv1a } from "./fnv1a";
import type { Registry } from "./registry.types";

/**
 * Sorted by name so registration order cannot change the fingerprint, and built from name and
 * version alone so unrelated edits — a slot constraint, a deprecation — do not invalidate every
 * artifact compiled before them.
 *
 * Slot `allow` lists resolve once the whole array is ingested, so a block may name a sibling
 * registered after it.
 */
export function createRegistry(blocks: readonly Block[]): Registry {
  const byName = new Map<string, Block>();
  for (const block of blocks) {
    if (byName.has(block.name)) {
      throw new Error(
        `Duplicate block name "${block.name}" — names are the identity nodes resolve through`,
      );
    }
    byName.set(block.name, block);
  }
  assertSlotAllows([...byName.values()]);

  const signature = [...byName.values()]
    .map((block) => `${block.name}@${block.version}`)
    .sort()
    .join("\n");
  const fingerprint = fnv1a(signature);

  return {
    get: (name) => byName.get(name),
    names: () => [...byName.keys()],
    fingerprint: () => fingerprint,
  };
}
