import { describe, expect, test } from "vitest";
import { z } from "zod";
import type { Artifact } from "./artifact.types";
import { checkRollback } from "./checkRollback";
import { createRegistry } from "./createRegistry";
import { defineBlock } from "./defineBlock";

const block = (name: string, version: number) =>
  defineBlock({ name, schema: z.object({}), component: null, version, slots: {} });

const artifactAtV1: Artifact = {
  hash: "h",
  route: "/x",
  documentId: "d",
  documentVersion: 1,
  registryFingerprint: "f",
  blockVersions: { Hero: 1 },
  tree: [],
  meta: { title: "t" },
  compiledWith: "0.0.0",
};

const registryAtV1 = createRegistry([block("Hero", 1)]);
const registryWithHeroAtV2 = createRegistry([block("Hero", 2)]);
const registryWithoutHero = createRegistry([block("Card", 1)]);

describe("checkRollback", () => {
  test("a rollback target compiled against the current registry is compatible", () => {
    expect(checkRollback(artifactAtV1, registryAtV1)).toEqual({ compatible: true });
  });

  test("names every block whose registered version has moved since compile", () => {
    const result = checkRollback(artifactAtV1, registryWithHeroAtV2);
    expect(result).toEqual({ compatible: false, drifted: ["Hero"] });
  });

  test("a block deleted since compile counts as drift, not as an absent check", () => {
    expect(checkRollback(artifactAtV1, registryWithoutHero)).toEqual({
      compatible: false,
      drifted: ["Hero"],
    });
  });
});
