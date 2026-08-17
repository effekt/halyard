import { describe, expect, test } from "vitest";
import { z } from "zod";
import type { InferProps } from "./block.types";
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

  // Type-level. It compiles or it does not — the assertions below are the test, and a
  // `@ts-expect-error` that stops being an error fails the typecheck rather than passing
  // quietly.
  test("InferProps derives props from the schema, with no second definition", () => {
    const shaped = z.object({
      title: z.string(),
      subtitle: z.string().optional(),
      count: z.number(),
    });
    type Props = InferProps<typeof shaped>;

    const complete: Props = { title: "t", subtitle: "s", count: 1 };
    const withoutOptional: Props = { title: "t", count: 1 };
    // @ts-expect-error `title` is required by the schema
    const missingRequired: Props = { count: 1 };
    // @ts-expect-error `count` is a number in the schema
    const wrongType: Props = { title: "t", count: "1" };

    expect([complete, withoutOptional, missingRequired, wrongType]).toHaveLength(4);
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
