import type { ArtifactStore } from "@nubbin/core";
// `next/cache.js`, not `next/cache`: Next ships no `exports` map, and ESM does not do
// extension resolution, so the bare subpath resolves only through a bundler. A publish
// script run with plain node is a legitimate consumer of this function.
import { revalidatePath } from "next/cache.js";

/** Pointer removed, then that one route invalidated — the next request renders a real 404. */
export async function unpublishRoute(store: ArtifactStore, route: string): Promise<void> {
  await store.unpublish(route);
  revalidatePath(route);
}
