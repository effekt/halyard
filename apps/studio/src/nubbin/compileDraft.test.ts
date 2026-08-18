import { fixtureRoutes } from "demo/fixtures/fixtureRoutes";
import { expect, test } from "vitest";
import { compileDraft } from "./compileDraft";

test("an unknown route compiles to nothing", () => {
  expect(compileDraft("/no-such-route")).toBeUndefined();
});

test("a fixture route compiles to an artifact addressed at that route", () => {
  const artifact = compileDraft("/about");
  expect(artifact?.route).toBe("/about");
  expect(artifact?.tree.length).toBeGreaterThan(0);
});

test("the same draft compiles to the same hash", () => {
  expect(compileDraft("/about")?.hash).toBe(compileDraft("/about")?.hash);
});

test("every committed draft compiles", () => {
  for (const route of Object.keys(fixtureRoutes)) {
    expect(compileDraft(route), route).toBeDefined();
  }
});
