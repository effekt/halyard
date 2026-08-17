import type { Artifact } from "@nubbin/core";

/** A minimal valid artifact; hash and route parameterized because the contract keys on both. */
export function artifactFixture(hash: string, route: string): Artifact {
  return {
    hash,
    route,
    documentId: "d1",
    documentVersion: 1,
    registryFingerprint: "f",
    blockVersions: { Hero: 1 },
    tree: [],
    meta: { title: "t" },
    compiledWith: "0.0.0",
  };
}
