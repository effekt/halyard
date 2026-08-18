import { describe, expect, test } from "vitest";
import { z } from "zod";
import { defineCatalog } from "./defineCatalog";

const heroSchema = z.object({ title: z.string(), price: z.number() });
const listSchema = z.object({ items: z.array(z.object({ heading: z.string() })) });

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

  test("fails registration when a data hint addresses an array-member path", () => {
    expect(() =>
      defineCatalog({
        List: { schema: listSchema, ui: { fields: { "items[].heading": { data: "request" } } } },
      }),
    ).toThrow(/List.*items\[\]\.heading/s);
  });

  test("keeps label and control hints legal on an array-member path", () => {
    expect(() =>
      defineCatalog({
        List: { schema: listSchema, ui: { fields: { "items[].heading": { label: "Heading" } } } },
      }),
    ).not.toThrow();
  });
});
