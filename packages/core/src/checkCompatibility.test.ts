import { describe, expect, test } from "vitest";
import { z } from "zod";
import type { Artifact, RoutePointer } from "./artifact.types";
import { checkCompatibility } from "./checkCompatibility";
import type { LiveRoute } from "./compatibility.types";
import { createRegistry } from "./createRegistry";
import { defineBlock } from "./defineBlock";

const block = (name: string, version: number) =>
  defineBlock({
    name,
    schema: z.object({ title: z.string() }),
    component: null,
    version,
    slots: {},
  });

const pointer = (route: string, hash: string): RoutePointer => ({
  route,
  matchKind: "exact",
  hash,
  updatedAt: "2026-01-01T00:00:00.000Z",
});

const artifact = (
  route: string,
  hash: string,
  blockVersions: Record<string, number>,
): Artifact => ({
  hash,
  route,
  documentId: route,
  documentVersion: 1,
  registryFingerprint: "f",
  blockVersions,
  tree: [],
  meta: { title: route },
  compiledWith: "0.0.0",
});

const liveHome: LiveRoute = {
  pointer: pointer("/", "aaaa1111"),
  artifact: artifact("/", "aaaa1111", { Hero: 1, LogoWall: 1 }),
};
const livePricing: LiveRoute = {
  pointer: pointer("/pricing", "bbbb2222"),
  artifact: artifact("/pricing", "bbbb2222", { Hero: 1 }),
};

const registryAsPublished = createRegistry([block("Hero", 1), block("LogoWall", 1)]);

describe("checkCompatibility", () => {
  test("a registry unchanged since publish leaves every live route renderable", () => {
    expect(checkCompatibility([liveHome, livePricing], registryAsPublished)).toEqual({
      checked: 2,
      compatible: true,
      incompatible: [],
    });
  });

  test("an incompatible version bump names the route, the artifact and the version delta", () => {
    const bumped = createRegistry([block("Hero", 2), block("LogoWall", 1)]);
    expect(checkCompatibility([liveHome, livePricing], bumped)).toEqual({
      checked: 2,
      compatible: false,
      incompatible: [
        {
          route: "/",
          hash: "aaaa1111",
          reason: "block-drift",
          drifted: [{ block: "Hero", live: 1, registered: 2 }],
        },
        {
          route: "/pricing",
          hash: "bbbb2222",
          reason: "block-drift",
          drifted: [{ block: "Hero", live: 1, registered: 2 }],
        },
      ],
    });
  });

  test("a deleted block reports a null registered version, not a bumped one", () => {
    const withoutLogoWall = createRegistry([block("Hero", 1)]);
    expect(checkCompatibility([liveHome], withoutLogoWall)).toEqual({
      checked: 1,
      compatible: false,
      incompatible: [
        {
          route: "/",
          hash: "aaaa1111",
          reason: "block-drift",
          drifted: [{ block: "LogoWall", live: 1, registered: null }],
        },
      ],
    });
  });

  test("a pointer whose artifact the store cannot read is incompatible on its own", () => {
    const dangling: LiveRoute = { pointer: pointer("/gone", "cccc3333"), artifact: null };
    expect(checkCompatibility([dangling], registryAsPublished)).toEqual({
      checked: 1,
      compatible: false,
      incompatible: [{ route: "/gone", hash: "cccc3333", reason: "unreadable-artifact" }],
    });
  });

  test("no live pointers is compatible, and says it read nothing", () => {
    expect(checkCompatibility([], registryAsPublished)).toEqual({
      checked: 0,
      compatible: true,
      incompatible: [],
    });
  });

  test("a block the registry gained since publish is not drift", () => {
    const withAnExtraBlock = createRegistry([
      block("Hero", 1),
      block("LogoWall", 1),
      block("StatBand", 1),
    ]);
    expect(checkCompatibility([liveHome], withAnExtraBlock).compatible).toBe(true);
  });
});
