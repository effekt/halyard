import { expect, test } from "vitest";
import { publishState } from "./publishState";

test("no pointer reads as not published", () => {
  expect(publishState("abc", undefined)).toBe("not published");
});

test("a pointer at the draft's own hash reads as current", () => {
  expect(publishState("abc", "abc")).toContain("matches this draft");
});

test("a pointer at another hash names it, so the drift is visible", () => {
  expect(publishState("abc", "def")).toContain("def");
});
