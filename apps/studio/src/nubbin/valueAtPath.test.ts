import { expect, test } from "vitest";
import { valueAtPath } from "./valueAtPath";

test("reads a top-level value", () => {
  expect(valueAtPath({ headline: "H" }, "headline")).toBe("H");
});

test("reads through a dotted path", () => {
  expect(valueAtPath({ cta: { label: "Go" } }, "cta.label")).toBe("Go");
});

test("an unset path reads undefined", () => {
  expect(valueAtPath({ cta: { label: "Go" } }, "cta.icon")).toBeUndefined();
});

test("a path through a non-object reads undefined", () => {
  expect(valueAtPath({ headline: "H" }, "headline.length.zero")).toBeUndefined();
});

test("an array-member path reads undefined — it names every member, not one", () => {
  expect(valueAtPath({ items: [{ title: "T" }] }, "items[].title")).toBeUndefined();
});
