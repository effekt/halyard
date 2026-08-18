import type { ArtifactStore } from "@nubbin/core";
import { compileDraft } from "./compileDraft";

/**
 * Write, then move the pointer — a pointer at an unwritten hash is a live 404, and the store
 * rejects it. Returns the hash the route now serves, or `undefined` when no draft exists.
 */
export async function publishDraft(
  store: ArtifactStore,
  route: string,
): Promise<string | undefined> {
  const artifact = compileDraft(route);
  if (artifact === undefined) {
    return undefined;
  }
  await store.write(artifact);
  await store.publish(route, artifact.hash);
  return artifact.hash;
}
