import type { Artifact, ArtifactStore, RoutePointer } from "@nubbin/core";
import { describe, expect, test } from "vitest";
import { readLiveRoutes } from "./readLiveRoutes";

const pointer = (route: string, hash: string): RoutePointer => ({
  route,
  matchKind: "exact",
  hash,
  updatedAt: "2026-01-01T00:00:00.000Z",
});

const artifact: Artifact = {
  hash: "aaaa1111",
  route: "/",
  documentId: "home",
  documentVersion: 1,
  registryFingerprint: "f",
  blockVersions: { Hero: 1 },
  tree: [],
  meta: { title: "Home" },
  compiledWith: "0.0.0",
};

/** An in-memory implementation of the interface, which is what an adapter's double may be. */
const storeOf = (routes: RoutePointer[], artifacts: Artifact[]): ArtifactStore => ({
  read: async (hash) => artifacts.find((candidate) => candidate.hash === hash) ?? null,
  write: async () => undefined,
  manifest: async () => ({ routes, generatedAt: "2026-01-01T00:00:00.000Z" }),
  pointer: async (route) => routes.find((candidate) => candidate.route === route) ?? null,
  publish: async () => undefined,
  unpublish: async () => undefined,
});

describe("readLiveRoutes", () => {
  test("pairs every pointer in the manifest with the artifact it names", async () => {
    const store = storeOf([pointer("/", "aaaa1111")], [artifact]);
    expect(await readLiveRoutes(store)).toEqual([{ pointer: pointer("/", "aaaa1111"), artifact }]);
  });

  test("a pointer the store cannot resolve is kept with a null artifact, never dropped", async () => {
    const store = storeOf([pointer("/gone", "cccc3333")], []);
    expect(await readLiveRoutes(store)).toEqual([
      { pointer: pointer("/gone", "cccc3333"), artifact: null },
    ]);
  });

  test("a store with no pointers reads as an empty list", async () => {
    expect(await readLiveRoutes(storeOf([], []))).toEqual([]);
  });
});
