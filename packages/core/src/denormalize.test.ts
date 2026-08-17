import { describe, expect, test } from "vitest";
import { denormalize } from "./denormalize";
import type { DocumentVersion } from "./document.types";

const doc = (elements: DocumentVersion["elements"], root = "n1"): DocumentVersion => ({
  documentId: "d1",
  version: 1,
  root,
  elements,
  meta: { title: "t" },
  createdAt: "2026-01-01T00:00:00Z",
  createdBy: "test",
});

describe("denormalize", () => {
  test("resolves ids into a nested tree and drops the flat index", () => {
    const tree = denormalize(
      doc({
        n1: { id: "n1", block: "Hero", props: { title: "T" }, slots: { items: ["n2"] } },
        n2: { id: "n2", block: "Card", props: { label: "L" } },
      }),
      (node) => ({ props: node.props, holes: {} }),
    );

    expect(tree).toHaveLength(1);
    expect(tree[0]?.slots?.items?.[0]?.id).toBe("n2");
    expect(tree[0]).not.toHaveProperty("elements");
  });

  test("omits holes entirely when a node has none, rather than emitting an empty object", () => {
    const [node] = denormalize(
      doc({ n1: { id: "n1", block: "Card", props: { label: "L" } } }),
      (node) => ({ props: node.props, holes: {} }),
    );
    expect(node).not.toHaveProperty("holes");
  });

  test("records a hole where the resolver reports one", () => {
    const [node] = denormalize(
      doc({ n1: { id: "n1", block: "Card", props: { label: "L", price: 1 } } }),
      (node) => ({ props: { label: node.props.label }, holes: { price: "request" } }),
    );
    expect(node?.holes).toEqual({ price: "request" });
    expect(node?.props).toEqual({ label: "L" });
  });
});
