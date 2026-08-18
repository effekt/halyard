import { expect, test } from "vitest";
import { isEditableField } from "./isEditableField";

test.each(["string", "number", "boolean", "enum"] as const)("%s fields are editable", (kind) => {
  expect(isEditableField({ kind, path: "headline" })).toBe(true);
});

test.each(["array", "object", "union", "unknown"] as const)("%s fields are not", (kind) => {
  expect(isEditableField({ kind, path: "items" })).toBe(false);
});

test("an array-member path is not editable whatever its kind", () => {
  expect(isEditableField({ kind: "string", path: "items[].title" })).toBe(false);
});
