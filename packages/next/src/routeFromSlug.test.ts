import { describe, expect, test } from "vitest";
import { routeFromSlug } from "./routeFromSlug";

describe("routeFromSlug", () => {
  test("an absent or empty slug is the root route", () => {
    expect(routeFromSlug(undefined)).toBe("/");
    expect(routeFromSlug([])).toBe("/");
  });

  test("segments join into the pointer key compile stamped on the artifact", () => {
    expect(routeFromSlug(["promotions", "summer"])).toBe("/promotions/summer");
  });
});
