import type { DocumentVersion } from "@nubbin/core";
import { describe, expect, it } from "vitest";
import { stampedVersion } from "./stampedVersion";

function version(elements: DocumentVersion["elements"]): DocumentVersion {
  return {
    documentId: "doc",
    version: 1,
    roots: ["stack"],
    elements,
    meta: { title: "t" },
    createdAt: "2026-01-01T00:00:00.000Z",
    createdBy: "test",
  };
}

describe("stampedVersion", () => {
  it("returns the same version when no stamp is given", () => {
    const base = version({ hero: { id: "hero", block: "Hero", props: { headline: "Original" } } });
    expect(stampedVersion(base)).toBe(base);
  });

  it("suffixes the first headline it finds", () => {
    const base = version({ hero: { id: "hero", block: "Hero", props: { headline: "Original" } } });
    const result = stampedVersion(base, "r7");
    expect(result.elements.hero?.props.headline).toBe("Original r7");
  });

  it("falls back to heading where there is no headline", () => {
    const base = version({ cta: { id: "cta", block: "CtaBanner", props: { heading: "Start" } } });
    expect(stampedVersion(base, "r7").elements.cta?.props.heading).toBe("Start r7");
  });

  it("stamps one node, not every node carrying a title", () => {
    const base = version({
      hero: { id: "hero", block: "Hero", props: { headline: "First" } },
      cta: { id: "cta", block: "CtaBanner", props: { heading: "Second" } },
    });
    const result = stampedVersion(base, "r7");
    expect(result.elements.hero?.props.headline).toBe("First r7");
    expect(result.elements.cta?.props.heading).toBe("Second");
  });

  it("leaves the input untouched", () => {
    const base = version({ hero: { id: "hero", block: "Hero", props: { headline: "Original" } } });
    stampedVersion(base, "r7");
    expect(base.elements.hero?.props.headline).toBe("Original");
  });

  // A silent no-op here would make assertion 4 pass for the wrong reason: winter's body would be
  // unchanged, which is what the assertion reads as "not invalidated".
  it("throws where no node carries a title prop", () => {
    const base = version({ stack: { id: "stack", block: "SectionStack", props: {} } });
    expect(() => stampedVersion(base, "r7")).toThrow(/no headline or heading prop/);
  });
});
