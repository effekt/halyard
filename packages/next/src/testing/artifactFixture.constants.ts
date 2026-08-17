import type { Artifact } from "@nubbin/core";

/** One published page, reused by every read-path test so each asserts on the same shape. */
export const SUMMER: Artifact = {
  hash: "a1",
  route: "/promotions/summer",
  documentId: "d1",
  documentVersion: 1,
  registryFingerprint: "f",
  blockVersions: {},
  tree: [],
  meta: { title: "t" },
  compiledWith: "0.0.0",
};
