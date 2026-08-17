import { describe, expect, test } from "vitest";
import { setAtPath } from "./setAtPath";

describe("setAtPath", () => {
  test("replaces a top-level key without mutating the input", () => {
    const input = { title: "T", price: 0 };
    const output = setAtPath(input, "price", 42);
    expect(output).toEqual({ title: "T", price: 42 });
    expect(input.price).toBe(0);
  });

  test("descends a dotted path, creating intermediate objects", () => {
    expect(setAtPath({}, "cta.price", 42)).toEqual({ cta: { price: 42 } });
  });

  test("rejects an array-member path, which no hole can address", () => {
    expect(() => setAtPath({}, "items[].price", 42)).toThrow(/items\[\]/);
  });
});
