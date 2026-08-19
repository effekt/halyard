import { describe, expect, test } from "vitest";
import { takeAtPath } from "./takeAtPath";

describe("takeAtPath", () => {
  test("removes a top-level key without mutating the input", () => {
    const input = { title: "T", price: 10 };
    const { rest, taken } = takeAtPath(input, "price");
    expect(taken).toBe(true);
    expect(rest).toEqual({ title: "T" });
    expect(input.price).toBe(10);
  });

  test("removes a nested leaf and leaves the rest of its parent standing", () => {
    const input = { title: "T", cta: { label: "Go", href: "/x" } };
    const { rest, taken } = takeAtPath(input, "cta.label");
    expect(taken).toBe(true);
    expect(rest).toEqual({ title: "T", cta: { href: "/x" } });
    expect(input.cta.label).toBe("Go");
  });

  test("reports nothing taken when the path is absent, returning the input untouched", () => {
    const input = { title: "T", cta: { href: "/x" } };
    expect(takeAtPath(input, "cta.label")).toEqual({ rest: input, taken: false });
    expect(takeAtPath(input, "subtitle")).toEqual({ rest: input, taken: false });
  });

  test("reports nothing taken when a path segment is not an object", () => {
    const input = { cta: "Go" };
    expect(takeAtPath(input, "cta.label")).toEqual({ rest: input, taken: false });
  });

  test("rejects an array-member path, which no hole can address", () => {
    expect(() => takeAtPath({}, "items[].price")).toThrow(/items\[\]/);
  });
});
