import { describe, expect, test } from "vitest";
import type { DocumentVersion } from "./document.types";
import { setNodeProp } from "./setNodeProp";

const version: DocumentVersion = {
  documentId: "doc",
  version: 3,
  root: "stack",
  elements: {
    stack: { id: "stack", block: "Stack", props: {}, slots: { sections: ["hero"] } },
    hero: {
      id: "hero",
      block: "Hero",
      props: { headline: "Before", cta: { label: "Go", href: "/" } },
    },
  },
  meta: { title: "T" },
  createdAt: "2026-01-01T00:00:00.000Z",
  createdBy: "test",
};

describe("setNodeProp", () => {
  test("sets a top-level prop on one node and nothing else", () => {
    const next = setNodeProp(version, "hero", "headline", "After");
    expect(next.elements.hero?.props.headline).toBe("After");
    expect(next.elements.hero?.props.cta).toEqual({ label: "Go", href: "/" });
    expect(next.elements.stack).toBe(version.elements.stack);
  });

  test("sets a nested prop through a dotted path", () => {
    const next = setNodeProp(version, "hero", "cta.label", "Buy");
    expect(next.elements.hero?.props.cta).toEqual({ label: "Buy", href: "/" });
  });

  test("never mutates the input version", () => {
    setNodeProp(version, "hero", "headline", "After");
    expect(version.elements.hero?.props.headline).toBe("Before");
  });

  test("keeps identity fields — version, createdAt, root — untouched", () => {
    const next = setNodeProp(version, "hero", "headline", "After");
    expect(next.version).toBe(3);
    expect(next.createdAt).toBe(version.createdAt);
    expect(next.root).toBe("stack");
    expect(next.meta).toBe(version.meta);
  });

  test("throws naming the node when the id is unknown", () => {
    expect(() => setNodeProp(version, "ghost", "headline", "x")).toThrow(/ghost/);
  });

  test("rejects an array-member path, which names every member rather than one", () => {
    expect(() => setNodeProp(version, "hero", "items[].title", "x")).toThrow(/items\[\]/);
  });
});
