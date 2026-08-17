import { describe, expect, test } from "vitest";
import { staticRouteParams } from "./staticRouteParams";
import { SUMMER } from "./testing/artifactFixture.constants";
import { stubStore } from "./testing/stubStore";

describe("staticRouteParams", () => {
  test("maps exact pointers to slug arrays, the root to an empty one", async () => {
    const store = stubStore(
      { a1: SUMMER, a2: { ...SUMMER, hash: "a2", route: "/" } },
      { "/promotions/summer": "a1", "/": "a2" },
    );
    expect(await staticRouteParams(store)).toEqual(
      expect.arrayContaining([{ slug: ["promotions", "summer"] }, { slug: [] }]),
    );
  });

  test("skips param and prefix pointers, which exact serving cannot prebuild", async () => {
    const store = stubStore(
      { a1: { ...SUMMER, route: "/guides/[city]" } },
      { "/guides/[city]": "a1" },
    );
    expect(await staticRouteParams(store)).toEqual([]);
  });
});
