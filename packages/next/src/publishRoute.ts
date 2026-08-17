import type { ArtifactStore } from "@nubbin/core";
import { revalidatePath } from "next/cache";

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
