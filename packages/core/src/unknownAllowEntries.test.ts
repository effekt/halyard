import { describe, expect, test } from "vitest";
import { z } from "zod";
import type { SlotConstraint } from "./block.types";
import { defineBlock } from "./defineBlock";
import { unknownAllowEntries } from "./unknownAllowEntries";

const block = (name: string, slots: Record<string, SlotConstraint>) =>
  defineBlock({ name, schema: z.object({ t: z.string() }), component: null, version: 1, slots });

describe("unknownAllowEntries", () => {
  test("reports an entry no registered name resolves, with its block and slot", () => {
    const page = block("Page", { items: { allow: ["Testimonal"] } });
    expect(unknownAllowEntries(page, new Set(["Page", "Testimonial"]))).toEqual([
      '"Testimonal" (Page.items)',
    ]);
  });

  test("reports every unresolvable entry across a block's slots", () => {
    const page = block("Page", {
      items: { allow: ["Testimonal", "Testimonial"] },
      aside: { allow: ["CtaCrd"] },
    });
    expect(unknownAllowEntries(page, new Set(["Page", "Testimonial", "CtaCard"]))).toEqual([
      '"Testimonal" (Page.items)',
      '"CtaCrd" (Page.aside)',
    ]);
  });

  test("an omitted allow list constrains nothing, so it reports nothing", () => {
    const page = block("Page", { items: { min: 1, max: 6 } });
    expect(unknownAllowEntries(page, new Set(["Page"]))).toEqual([]);
  });
});
