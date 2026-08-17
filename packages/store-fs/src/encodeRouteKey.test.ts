import { describe, expect, test } from "vitest";
import { encodeRouteKey } from "./encodeRouteKey";

describe("encodeRouteKey", () => {
  test("keeps the path separator out of the filename", () => {
    expect(encodeRouteKey("/promotions/summer")).not.toContain("/");
  });

  test("distinct routes produce distinct keys, including the root", () => {
    const keys = [encodeRouteKey("/"), encodeRouteKey("/a"), encodeRouteKey("/a/b")];
    expect(new Set(keys).size).toBe(3);
  });
});
