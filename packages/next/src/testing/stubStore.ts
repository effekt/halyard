import type { Artifact, ArtifactStore } from "@nubbin/core";
import { parseMatchKind } from "@nubbin/core";
import { refuseWrite } from "./refuseWrite";

/** Read-side methods real, write-side throwing — this binding's read path must never write. */
export function stubStore(
  artifacts: Record<string, Artifact>,
  published: Record<string, string>,
): ArtifactStore {
  return {
    read: async (hash) => artifacts[hash] ?? null,
    pointer: async (route) => {
      const hash = published[route];
      if (hash === undefined) {
        return null;
      }
      return { route, matchKind: parseMatchKind(route), hash, updatedAt: "1970-01-01T00:00:00Z" };
    },
    manifest: async () => ({
      routes: Object.entries(published).map(([route, hash]) => ({
        route,
        matchKind: parseMatchKind(route),
        hash,
        updatedAt: "1970-01-01T00:00:00Z",
      })),
      generatedAt: "1970-01-01T00:00:00Z",
    }),
    write: refuseWrite("write"),
    publish: refuseWrite("publish"),
    unpublish: refuseWrite("unpublish"),
  };
}
