import type { ArtifactStore } from "@nubbin/core";
import { describe, expect, test } from "vitest";
import { artifactFixture } from "./artifactFixture";

/**
 * One suite, every implementation. An adapter passing by eye instead of by execution is the
 * failure this exists to prevent.
 */
export function runArtifactStoreContract(
  name: string,
  makeStore: () => Promise<ArtifactStore>,
): void {
  describe(`ArtifactStore contract: ${name}`, () => {
    test("write then read round-trips; an unknown hash reads null", async () => {
      const store = await makeStore();
      const artifact = artifactFixture("a1", "/x");
      await store.write(artifact);
      expect(await store.read("a1")).toEqual(artifact);
      expect(await store.read("ghost")).toBeNull();
    });

    test("writing an already-stored hash again is a no-op, not an error", async () => {
      const store = await makeStore();
      await store.write(artifactFixture("a1", "/x"));
      await expect(store.write(artifactFixture("a1", "/x"))).resolves.toBeUndefined();
    });

    test("publish writes a pointer with matchKind parsed from the route", async () => {
      const store = await makeStore();
      await store.write(artifactFixture("a1", "/x"));
      await store.publish("/x", "a1");
      const pointer = await store.pointer("/x");
      expect(pointer?.hash).toBe("a1");
      expect(pointer?.matchKind).toBe("exact");
      expect(await store.pointer("/never")).toBeNull();
    });

    test("publish rejects a hash that was never written — no dead pointers", async () => {
      const store = await makeStore();
      await expect(store.publish("/x", "ghost")).rejects.toThrow(/ghost/);
    });

    test("publishing the same route and hash twice is a safe no-op", async () => {
      const store = await makeStore();
      await store.write(artifactFixture("a1", "/x"));
      await store.publish("/x", "a1");
      await expect(store.publish("/x", "a1")).resolves.toBeUndefined();
    });

    test("unpublish removes the pointer, keeps the artifact, and tolerates a missing pointer", async () => {
      const store = await makeStore();
      await store.write(artifactFixture("a1", "/x"));
      await store.publish("/x", "a1");
      await store.unpublish("/x");
      expect(await store.pointer("/x")).toBeNull();
      expect(await store.read("a1")).not.toBeNull();
      await expect(store.unpublish("/x")).resolves.toBeUndefined();
    });

    test("publishes to different routes never contend, and manifest lists them all", async () => {
      const store = await makeStore();
      await store.write(artifactFixture("a1", "/x"));
      await store.write(artifactFixture("a2", "/y"));
      await Promise.all([store.publish("/x", "a1"), store.publish("/y", "a2")]);
      const { routes } = await store.manifest();
      expect(routes.map((pointer) => pointer.route).sort()).toEqual(["/x", "/y"]);
    });
  });
}
