import { describe, expect, test } from "vitest";
import { z } from "zod";
import { defineCatalog } from "./defineCatalog";

const heroSchema = z.object({ title: z.string(), price: z.number() });

describe("defineCatalog", () => {
  test("keeps entries addressable by block name", () => {
    const catalog = defineCatalog({ Hero: { schema: heroSchema } });
    expect(catalog.Hero?.schema).toBe(heroSchema);
  });

  test("fails registration when a ui hint names a field the schema lacks", () => {
    expect(() =>
      defineCatalog({ Hero: { schema: heroSchema, ui: { fields: { subtitle: {} } } } }),
    ).toThrow(/subtitle/);
  });

  test("fails registration when defaults do not satisfy the schema", () => {
    expect(() =>
      defineCatalog({ Hero: { schema: heroSchema, defaults: { title: "Hi" } } }),
    ).toThrow(/price/);
  });
});
