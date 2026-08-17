import { describe, expect, test } from "vitest";
import { z } from "zod";
import { faqItemSchema } from "../blocks/faqItem.schema";
import { statItemSchema } from "../blocks/statItem.schema";
import { demoHoleValue } from "./demoHoleValue";

const payload = { now: Date.parse("2026-08-01T00:00:00Z"), served: 7 };

describe("demoHoleValue", () => {
  // The failure with no other guard anywhere: a value of the wrong shape. `stats` becomes a
  // `<ul>` of `stat.value`/`stat.label`, so a missing key renders blank rather than erroring.
  // Parsing against the schema the artifact was compiled with is what makes that a test failure.
  test("StatBand.stats satisfies the field's real schema", () => {
    const stats = z.array(statItemSchema).parse(demoHoleValue("StatBand", "stats", payload));
    expect(stats[0]?.value).toBe("7");
  });

  test("FaqAccordion.items satisfies the field's real schema", () => {
    const items = z.array(faqItemSchema).parse(demoHoleValue("FaqAccordion", "items", payload));
    expect(items[0]?.answer).toBe("2026-08-01T00:00:00.000Z");
  });

  test("an unmapped field fails loudly rather than rendering nothing", () => {
    expect(() => demoHoleValue("Hero", "headline", payload)).toThrow(
      "no demo resolver for Hero.headline",
    );
  });
});
