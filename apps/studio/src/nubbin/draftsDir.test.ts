import { join } from "node:path";
import { afterEach, expect, test } from "vitest";
import { draftsDir } from "./draftsDir";

afterEach(() => {
  delete process.env.NUBBIN_STUDIO_DRAFTS;
});

test("defaults to .drafts beside the process's working directory", () => {
  delete process.env.NUBBIN_STUDIO_DRAFTS;
  expect(draftsDir()).toBe(join(process.cwd(), ".drafts"));
});

test("the environment override wins, so parallel test files never share a directory", () => {
  process.env.NUBBIN_STUDIO_DRAFTS = "/somewhere/else";
  expect(draftsDir()).toBe("/somewhere/else");
});
