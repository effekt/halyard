import { describe, expect, test } from "vitest";
import { z } from "zod";
import { resolveHintPaths } from "./resolveHintPaths";

const schema = z.object({
  title: z.string(),
  cta: z.object({ label: z.string() }),
  items: z.array(z.object({ heading: z.string() })),
});

describe("resolveHintPaths", () => {
  test("accepts hints on real paths, including nested and array-member paths", () => {
    expect(() =>
      resolveHintPaths("Hero", schema, { title: {}, "cta.label": {}, "items[].heading": {} }),
    ).not.toThrow();
  });

  test("rejects a hint on a field that does not exist, naming the block and the path", () => {
    expect(() => resolveHintPaths("Hero", schema, { subtitle: {} })).toThrow(/Hero.*subtitle/s);
  });

  test("rejects a hint whose path is a near miss, because that is the likely real mistake", () => {
    expect(() => resolveHintPaths("Hero", schema, { "cta.text": {} })).toThrow(/cta\.text/);
  });
});
