import { describe, expect, test } from "vitest";
import { hashArtifact } from "./hashArtifact";

describe("hashArtifact", () => {
  test("the same input hashes identically regardless of key insertion order", () => {
    const original = {
      route: "/x",
      documentId: "d",
      documentVersion: 1,
      registryFingerprint: "f",
      blockVersions: { Hero: 1, Card: 1 },
      tree: [],
      meta: { title: "t" },
      compiledWith: "0.0.0",
    };
    const reordered = {
      compiledWith: "0.0.0",
      meta: { title: "t" },
      tree: [],
      blockVersions: { Card: 1, Hero: 1 },
      registryFingerprint: "f",
      documentVersion: 1,
      documentId: "d",
      route: "/x",
    };
    expect(hashArtifact(original)).toBe(hashArtifact(reordered));
  });

  test("the hash changes when any compiled input changes", () => {
    const base = {
      route: "/x",
      documentId: "d",
      documentVersion: 1,
      registryFingerprint: "f",
      blockVersions: { Hero: 1 },
      tree: [],
      meta: { title: "t" },
      compiledWith: "0.0.0",
    };
    expect(hashArtifact({ ...base, documentVersion: 2 })).not.toBe(hashArtifact(base));
    expect(hashArtifact({ ...base, registryFingerprint: "g" })).not.toBe(hashArtifact(base));
  });
});
