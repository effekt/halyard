import { describe, expect, test } from "vitest";
import { formatRouteIncompatibility } from "./formatRouteIncompatibility";

describe("formatRouteIncompatibility", () => {
  test("names the route and the artifact, then every block under it", () => {
    expect(
      formatRouteIncompatibility({
        route: "/pricing",
        hash: "7f455acf",
        reason: "block-drift",
        drifted: [
          { block: "PlanTiers", live: 1, registered: 2 },
          { block: "Hero", live: 1, registered: null },
        ],
      }),
    ).toBe(
      [
        "  /pricing  (artifact 7f455acf)",
        "    PlanTiers: page needs v1, registry has v2",
        "    Hero: page needs v1, no longer in the registry",
      ].join("\n"),
    );
  });

  test("a pointer into nothing says so instead of listing blocks", () => {
    expect(
      formatRouteIncompatibility({
        route: "/gone",
        hash: "cccc3333",
        reason: "unreadable-artifact",
      }),
    ).toBe(
      ["  /gone  (artifact cccc3333)", "    the store holds no artifact at this hash"].join("\n"),
    );
  });
});
