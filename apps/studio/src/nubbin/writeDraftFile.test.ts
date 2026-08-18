import { mkdtempSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { about } from "demo/fixtures/about";
import { expect, test } from "vitest";
import { readDraftFile } from "./readDraftFile";
import { writeDraftFile } from "./writeDraftFile";

const freshDir = () => mkdtempSync(join(tmpdir(), "nubbin-drafts-"));

test("creates the directory it writes into", () => {
  const filePath = join(freshDir(), "deeper", "%2F.json");
  writeDraftFile(filePath, about);
  expect(readDraftFile(filePath)).toEqual(about);
});

test("a second write overwrites the first — the slot keeps no history", () => {
  const dir = freshDir();
  const filePath = join(dir, "%2Fabout.json");
  writeDraftFile(filePath, about);
  const edited = { ...about, meta: { title: "Edited" } };
  writeDraftFile(filePath, edited);
  expect(readDraftFile(filePath)).toEqual(edited);
  expect(readdirSync(dir)).toEqual(["%2Fabout.json"]);
});
