import { about } from "demo/fixtures/about";
import { catalog } from "demo/src/nubbin/catalog";
import { expect, test } from "vitest";
import { toInspectorNodes } from "./toInspectorNodes";

test("describes every node in the draft", () => {
  const nodes = toInspectorNodes(about, catalog);
  expect(Object.keys(nodes).sort()).toEqual(Object.keys(about.elements).sort());
});

test("pairs schema fields with the draft's current values", () => {
  const hero = toInspectorNodes(about, catalog).hero;
  const headline = hero?.fields.find((field) => field.path === "headline");
  expect(headline?.kind).toBe("string");
  expect(headline?.value).toBe(about.elements.hero?.props.headline);
});

test("reads nested values through dotted paths", () => {
  const hero = toInspectorNodes(about, catalog).hero;
  const label = hero?.fields.find((field) => field.path === "cta.label");
  expect(label?.value).toBe("See how it reads");
});

test("a node whose block the catalog lacks gets no fields rather than a throw", () => {
  const stray = {
    ...about,
    elements: { lone: { id: "lone", block: "NoSuchBlock", props: {} } },
    roots: ["lone"],
  };
  expect(toInspectorNodes(stray, catalog).lone?.fields).toEqual([]);
});
