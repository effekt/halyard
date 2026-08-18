import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { about } from "demo/fixtures/about";
import { beforeEach, expect, test } from "vitest";
import { draftFilePath } from "./draftFilePath";
import { readDraft } from "./readDraft";
import { writeDraftFile } from "./writeDraftFile";

beforeEach(() => {
  process.env.NUBBIN_STUDIO_DRAFTS = mkdtempSync(join(tmpdir(), "nubbin-drafts-"));
});

test("a route with no draft file reads its committed fixture", () => {
  expect(readDraft("/about")).toBe(about);
});

test("an edited route reads its draft file instead", () => {
  const edited = { ...about, meta: { title: "Edited" } };
  writeDraftFile(draftFilePath("/about"), edited);
  expect(readDraft("/about")).toEqual(edited);
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
