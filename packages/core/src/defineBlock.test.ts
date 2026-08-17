import { describe, expect, test } from "vitest";
import { z } from "zod";
import { defineBlock } from "./defineBlock";

const heroSchema = z.object({ title: z.string() });
const Hero = () => null;

describe("defineBlock", () => {
  test("returns the block unchanged so types are fixed at the call site", () => {
    const block = defineBlock({
      name: "Hero",
      schema: heroSchema,
      component: Hero,
      version: 1,
      slots: {},
    });
    expect(block.name).toBe("Hero");
    expect(block.component).toBe(Hero);
  });

  test("rejects a version below 1, because artifacts record the version they compiled against", () => {
    expect(() =>
      defineBlock({ name: "Hero", schema: heroSchema, component: Hero, version: 0, slots: {} }),
    ).toThrow(/version/i);
  });

  test("rejects a slot whose min exceeds its max, which no composition could satisfy", () => {
    expect(() =>
      defineBlock({
        name: "Hero",
        schema: heroSchema,
        component: Hero,
        version: 1,
        slots: { items: { min: 3, max: 2 } },
      }),
    ).toThrow(/items/);
  });

  test("rejects a migrate key that is not a version this block can migrate to", () => {
    expect(() =>
      defineBlock({
        name: "Hero",
        schema: heroSchema,
        component: Hero,
        version: 2,
        slots: {},
        migrate: { 5: (props) => props },
      }),
    ).toThrow(/5/);
  });
});
