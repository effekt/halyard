import { describe, expect, test } from "vitest";
import { z } from "zod";
import { createRegistry } from "./createRegistry";
import { defineBlock } from "./defineBlock";
import type { DocumentVersion } from "./document.types";
import { validateStructure } from "./validateStructure";

const hero = defineBlock({
  name: "Hero",
  schema: z.object({ title: z.string() }),
  component: null,
  version: 1,
  slots: { items: { allow: ["Card"], min: 1, max: 2 } },
});
const card = defineBlock({
  name: "Card",
  schema: z.object({ label: z.string() }),
  component: null,
  version: 1,
  slots: {},
});
const registry = createRegistry([hero, card]);

const doc = (
  elements: DocumentVersion["elements"],
  roots: readonly string[] = ["n1"],
): DocumentVersion => ({
  documentId: "d1",
  version: 1,
  roots,
  elements,
  meta: { title: "t" },
  createdAt: "2026-01-01T00:00:00Z",
  createdBy: "test",
});

const codes = (version: DocumentVersion) =>
  validateStructure(version, registry).map((issue) => `${issue.code}:${issue.nodeId}`);

describe("validateStructure", () => {
  test("accepts a well-formed document", () => {
    expect(
      codes(
        doc({
          n1: { id: "n1", block: "Hero", props: { title: "T" }, slots: { items: ["n2"] } },
          n2: { id: "n2", block: "Card", props: { label: "L" } },
        }),
      ),
    ).toEqual([]);
  });

  test("reports a block name the registry does not know", () => {
    expect(codes(doc({ n1: { id: "n1", block: "Ghost", props: {} } }))).toEqual([
      "unknown-block:n1",
    ]);
  });

  test("reports a slot child id with no matching element", () => {
    expect(
      codes(
        doc({
          n1: { id: "n1", block: "Hero", props: { title: "T" }, slots: { items: ["missing"] } },
        }),
      ),
    ).toContain("dangling-child:n1");
  });

  test("reports a cycle rather than looping forever", () => {
    expect(
      codes(
        doc({
          n1: { id: "n1", block: "Hero", props: { title: "T" }, slots: { items: ["n2"] } },
          n2: { id: "n2", block: "Card", props: { label: "L" }, slots: { items: ["n1"] } },
        }),
      ),
    ).toContain("cycle:n2");
  });

  test("reports a node no slot reaches, which would be dropped silently by denormalization", () => {
    expect(
      codes(
        doc({
          n1: { id: "n1", block: "Hero", props: { title: "T" }, slots: { items: ["n2"] } },
          n2: { id: "n2", block: "Card", props: { label: "L" } },
          orphan: { id: "orphan", block: "Card", props: { label: "L" } },
        }),
      ),
    ).toContain("unreachable:orphan");
  });

  test("reports a child whose block is not in the slot's allow list", () => {
    expect(
      codes(
        doc({
          n1: { id: "n1", block: "Hero", props: { title: "T" }, slots: { items: ["n2"] } },
          n2: { id: "n2", block: "Hero", props: { title: "T" } },
        }),
      ),
    ).toContain("slot-not-allowed:n2");
  });

  test("reports a required slot the node leaves unfilled, not only one filled below min", () => {
    expect(codes(doc({ n1: { id: "n1", block: "Hero", props: { title: "T" } } }))).toContain(
      "slot-min:n1",
    );
  });

  test("reports a slot below min and a slot above max", () => {
    expect(
      codes(
        doc({
          n1: { id: "n1", block: "Hero", props: { title: "T" }, slots: { items: [] } },
        }),
      ),
    ).toContain("slot-min:n1");
    expect(
      codes(
        doc({
          n1: {
            id: "n1",
            block: "Hero",
            props: { title: "T" },
            slots: { items: ["n2", "n3", "n4"] },
          },
          n2: { id: "n2", block: "Card", props: { label: "L" } },
          n3: { id: "n3", block: "Card", props: { label: "L" } },
          n4: { id: "n4", block: "Card", props: { label: "L" } },
        }),
      ),
    ).toContain("slot-max:n1");
  });

  test("rejects a document with no roots at all", () => {
    expect(codes(doc({ n1: { id: "n1", block: "Card", props: { label: "L" } } }, []))).toEqual([
      "no-roots:",
    ]);
  });

  test("names the root that has no matching element", () => {
    const issues = validateStructure(
      doc({ n1: { id: "n1", block: "Card", props: { label: "L" } } }, ["n1", "ghost"]),
      registry,
    );
    const dangling = issues.find((issue) => issue.code === "dangling-child");
    expect(dangling?.nodeId).toBe("ghost");
    expect(dangling?.message).toContain('"ghost"');
  });

  test("reports a cycle reachable only from the second root", () => {
    expect(
      codes(
        doc(
          {
            n1: { id: "n1", block: "Card", props: { label: "L" } },
            n2: { id: "n2", block: "Hero", props: { title: "T" }, slots: { items: ["n3"] } },
            n3: { id: "n3", block: "Card", props: { label: "L" }, slots: { items: ["n2"] } },
          },
          ["n1", "n2"],
        ),
      ),
    ).toContain("cycle:n3");
  });
});
