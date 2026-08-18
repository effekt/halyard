import { about } from "demo/fixtures/about";
import { afterEach, expect, test } from "vitest";
import { editedDrafts } from "./editedDrafts";
import { readDraft } from "./readDraft";

afterEach(() => {
  editedDrafts.clear();
});

test("an unedited route reads its committed fixture", () => {
  expect(readDraft("/about")).toBe(about);
});

test("an edited route reads the in-process edit instead", () => {
  const edited = { ...about, meta: { title: "Edited" } };
  editedDrafts.set("/about", edited);
  expect(readDraft("/about")).toBe(edited);
});

test("an unknown route reads nothing", () => {
  expect(readDraft("/no-such-route")).toBeUndefined();
});

test.each(["constructor", "__proto__", "toString"])(
  "a route named after Object.prototype's %s reads nothing",
  (route) => {
    expect(readDraft(route)).toBeUndefined();
  },
);
