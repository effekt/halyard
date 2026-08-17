import type { Artifact, ArtifactStore } from "@nubbin/core";
import { routeFromSlug } from "./routeFromSlug";

/**
 * The whole production read path: one pointer read, one artifact read. Null means the caller
 * renders a real 404 — an unpublished route has no pointer, which is what makes unpublish a
 * server 404 rather than an empty page.
 */
export async function resolveArtifact(
  store: ArtifactStore,
  slug: readonly string[] | undefined,
): Promise<Artifact | null> {
  const pointer = await store.pointer(routeFromSlug(slug));
  if (!pointer) {
    return null;
  }
  return store.read(pointer.hash);
}
