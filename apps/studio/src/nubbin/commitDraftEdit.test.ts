import { CompileError } from "@nubbin/core";
import { about } from "demo/fixtures/about";
import { afterEach, expect, test } from "vitest";
import { commitDraftEdit } from "./commitDraftEdit";
import { compileDraft } from "./compileDraft";
import { editedDrafts } from "./editedDrafts";
import { readDraft } from "./readDraft";

afterEach(() => {
  editedDrafts.clear();
});

test("a committed edit changes what the route compiles to", () => {
  const before = compileDraft("/about");
  const artifact = commitDraftEdit("/about", "hero", "headline", "A new headline");
  expect(artifact?.hash).not.toBe(before?.hash);
  expect(compileDraft("/about")?.hash).toBe(artifact?.hash);
});

test("edits accumulate: a second commit keeps the first", () => {
  commitDraftEdit("/about", "hero", "headline", "First");
  commitDraftEdit("/about", "hero", "eyebrow", "Second");
  const draft = readDraft("/about");
  expect(draft?.elements.hero?.props.headline).toBe("First");
  expect(draft?.elements.hero?.props.eyebrow).toBe("Second");
});

test("an edit that fails validation throws and keeps nothing", () => {
  expect(() => commitDraftEdit("/about", "hero", "cta.href", 7)).toThrow(CompileError);
  expect(readDraft("/about")).toBe(about);
});

test("an unknown route commits nothing", () => {
  expect(commitDraftEdit("/no-such-route", "hero", "headline", "x")).toBeUndefined();
});
