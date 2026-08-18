import type { ArtifactStore, LiveRoute } from "@nubbin/core";

/**
 * The whole of the guardrail's IO: every route pointer, and the artifact each one names. `core`
 * is handed the result and never the store, because `core` computes and adapters read — which
 * is also what lets the same check run against any store a consumer brings.
 */
export async function readLiveRoutes(store: ArtifactStore): Promise<LiveRoute[]> {
  const { routes } = await store.manifest();
  return Promise.all(
    routes.map(async (pointer) => ({ pointer, artifact: await store.read(pointer.hash) })),
  );
}
