import { describe, expect, test } from "vitest";
import { z } from "zod";
import { assertSlotAllows } from "./assertSlotAllows";
import type { SlotConstraint } from "./block.types";
import { defineBlock } from "./defineBlock";

const block = (name: string, slots: Record<string, SlotConstraint> = {}) =>
  defineBlock({ name, schema: z.object({ t: z.string() }), component: null, version: 1, slots });

describe("assertSlotAllows", () => {
  test("accepts a list whose every entry names a block in the same array", () => {
    expect(() =>
      assertSlotAllows([
        block("Page", { items: { allow: ["Testimonial"] } }),
        block("Testimonial"),
      ]),
    ).not.toThrow();
  });

  test("throws naming every unresolvable entry and the blocks that are registered", () => {
    const blocks = [
      block("Page", { items: { allow: ["Testimonal"] } }),
      block("Aside", { cards: { allow: ["CtaCrd"] } }),
      block("Testimonial"),
    ];
    expect(() => assertSlotAllows(blocks)).toThrow(
      /"Testimonal" \(Page\.items\), "CtaCrd" \(Aside\.cards\).*Registered blocks: Aside, Page, Testimonial/s,
    );
  });
});
