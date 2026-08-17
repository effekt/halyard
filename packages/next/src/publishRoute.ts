import type { ArtifactStore } from "@nubbin/core";
// `next/cache.js`, not `next/cache`: Next ships no `exports` map, and ESM does not do
// extension resolution, so the bare subpath resolves only through a bundler. A publish
// script run with plain node is a legitimate consumer of this function.
import { revalidatePath } from "next/cache.js";

/**
 * Pointer first, invalidation second. The reverse order re-caches the outgoing page during
 * the gap, and the publish appears to have silently not happened. The store's own publish
 * rejects a hash that was never written, so a failed publish never purges a working page.
 */
export async function publishRoute(
  store: ArtifactStore,
  route: string,
  hash: string,
): Promise<void> {
  await store.publish(route, hash);
  revalidatePath(route);
}
