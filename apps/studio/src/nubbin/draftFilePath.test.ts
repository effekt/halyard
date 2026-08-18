import { basename, dirname } from "node:path";
import { afterEach, expect, test } from "vitest";
import { draftFilePath } from "./draftFilePath";
import { draftsDir } from "./draftsDir";

afterEach(() => {
  delete process.env.NUBBIN_STUDIO_DRAFTS;
});

test("keeps the path separator out of the filename, so routes cannot nest", () => {
  expect(basename(draftFilePath("/promotions/summer"))).not.toContain("/");
});

test("distinct routes land on distinct files, including the root", () => {
  const paths = [draftFilePath("/"), draftFilePath("/a"), draftFilePath("/a/b")];
  expect(new Set(paths).size).toBe(3);
});

test("every draft file lives directly inside the drafts directory", () => {
  process.env.NUBBIN_STUDIO_DRAFTS = "/tmp/nubbin-drafts-test";
  expect(dirname(draftFilePath("/about"))).toBe(draftsDir());
});
