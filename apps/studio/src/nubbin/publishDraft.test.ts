import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Artifact, ArtifactStore, RoutePointer } from "@nubbin/core";
import { beforeEach, expect, test } from "vitest";
import { publishDraft } from "./publishDraft";

beforeEach(() => {
  process.env.NUBBIN_STUDIO_DRAFTS = mkdtempSync(join(tmpdir(), "nubbin-drafts-"));
});

/** In-memory implementation of the store interface, with the same publish precondition the
 * fs adapter enforces: a pointer may only name a written hash. */
function memoryStore(): ArtifactStore {
  const artifacts = new Map<string, Artifact>();
  const pointers = new Map<string, RoutePointer>();
  return {
    read: (hash) => Promise.resolve(artifacts.get(hash) ?? null),
    write: (artifact) => {
      artifacts.set(artifact.hash, artifact);
      return Promise.resolve();
    },
    manifest: () =>
      Promise.resolve({ routes: [...pointers.values()], generatedAt: new Date().toISOString() }),
    pointer: (route) => Promise.resolve(pointers.get(route) ?? null),
    publish: (route, hash) => {
      if (!artifacts.has(hash)) {
        return Promise.reject(new Error(`unwritten hash ${hash}`));
      }
      pointers.set(route, { route, matchKind: "exact", hash, updatedAt: new Date().toISOString() });
      return Promise.resolve();
    },
    unpublish: (route) => {
      pointers.delete(route);
      return Promise.resolve();
    },
  };
}

test("publishing a draft writes the artifact and moves the pointer to it", async () => {
  const store = memoryStore();
  const hash = await publishDraft(store, "/about");
  expect(hash).toBeDefined();
  const pointer = await store.pointer("/about");
  expect(pointer?.hash).toBe(hash);
  const artifact = hash === undefined ? null : await store.read(hash);
  expect(artifact?.route).toBe("/about");
});

test("a route with no draft publishes nothing", async () => {
  const store = memoryStore();
  expect(await publishDraft(store, "/no-such-route")).toBeUndefined();
  expect(await store.pointer("/no-such-route")).toBeNull();
});
