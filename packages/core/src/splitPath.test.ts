import { describe, expect, test } from "vitest";
import { splitPath } from "./splitPath";

describe("splitPath", () => {
  test("returns a single segment with nothing below it", () => {
    expect(splitPath("price")).toEqual({ head: "price", tail: [] });
  });

  test("returns the first segment and the segments below it", () => {
    expect(splitPath("cta.link.label")).toEqual({ head: "cta", tail: ["link", "label"] });
  });

  test("rejects an array-member segment, which no hole can address", () => {
    expect(() => splitPath("items[].price")).toThrow(/items\[\]/);
  });

  test("rejects an empty leading segment", () => {
    expect(() => splitPath("")).toThrow(/not addressable/);
    expect(() => splitPath(".price")).toThrow(/not addressable/);
  });
});
