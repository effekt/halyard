import { describe, expect, test } from "vitest";
import { z } from "zod";
import type { Artifact } from "./artifact.types";
import { createRegistry } from "./createRegistry";
import { defineBlock } from "./defineBlock";
import { describeDrift } from "./describeDrift";

const block = (name: string, version: number) =>
  defineBlock({
    name,
    schema: z.object({ title: z.string() }),
    component: null,
    version,
    slots: {},
  });

const artifact: Artifact = {
  hash: "aaaa1111",
  route: "/",
  documentId: "home",
  documentVersion: 1,
  registryFingerprint: "f",
  blockVersions: { Hero: 1, LogoWall: 2 },
  tree: [],
  meta: { title: "Home" },
  compiledWith: "0.0.0",
};

describe("describeDrift", () => {
  test("reports the version the artifact needs beside the one registered now", () => {
    const registry = createRegistry([block("Hero", 3), block("LogoWall", 2)]);
    expect(describeDrift(artifact, registry, ["Hero"])).toEqual([
      { block: "Hero", live: 1, registered: 3 },
    ]);
  });

  test("a block the registry no longer holds registers as null, not as zero", () => {
    const registry = createRegistry([block("LogoWall", 2)]);
    expect(describeDrift(artifact, registry, ["Hero"])).toEqual([
      { block: "Hero", live: 1, registered: null },
    ]);
  });

  test("a name the artifact never recorded is dropped rather than given a made-up version", () => {
    const registry = createRegistry([block("Hero", 1)]);
    expect(describeDrift(artifact, registry, ["StatBand"])).toEqual([]);
  });
});
