import type { ArtifactStore } from "@nubbin/core";

/**
 * generateStaticParams source. manifest() is an advisory read for exactly this — no request
 * ever goes through it. Non-exact pointers are excluded until #5 settles pattern routing.
 */
export async function staticRouteParams(store: ArtifactStore): Promise<{ slug: string[] }[]> {
  const { routes } = await store.manifest();
  return routes
    .filter((pointer) => pointer.matchKind === "exact")
    .map((pointer) => ({ slug: pointer.route.split("/").filter((segment) => segment.length > 0) }));
}
