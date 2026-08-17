import { describe, expect, test } from "vitest";
import { blockRegistry } from "./blockRegistry";
import { registry } from "./registry";

describe("blockRegistry", () => {
  test("names exactly the blocks the compile-side registry knows", () => {
    expect(Object.keys(blockRegistry).sort()).toEqual(registry.names().sort());
  });

  // `Object.entries` rather than indexing by name: `defineRegistry` returns the literal map, so
  // an arbitrary string is not a key of it.
  test.each(Object.entries(blockRegistry))(
    "%s resolves to a component",
    async (_name, importer) => {
      // A `() => import("./Hero")` that forgot its `.then` resolves to a module namespace, which
      // the renderer cannot invoke. Nothing else here would notice until a page rendered.
      expect(typeof (await importer())).toBe("function");
    },
  );
});
