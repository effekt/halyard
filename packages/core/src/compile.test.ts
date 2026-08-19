import { describe, expect, test } from "vitest";
import { z } from "zod";
import { CompileError } from "./CompileError";
import { compile } from "./compile";
import { createRegistry } from "./createRegistry";
import { defineBlock } from "./defineBlock";
import { defineCatalog } from "./defineCatalog";
import type { DocumentVersion } from "./document.types";
import { NUBBIN_VERSION } from "./version.constants";

const heroSchema = z.object({ title: z.string(), price: z.number() });
const cardSchema = z.object({ label: z.string() });

const hero = defineBlock({
  name: "Hero",
  schema: heroSchema,
  component: null,
  version: 1,
  slots: { items: { allow: ["Card"], max: 2 } },
});
const card = defineBlock({
  name: "Card",
  schema: cardSchema,
  component: null,
  version: 1,
  slots: {},
});
const registry = createRegistry([hero, card]);
const catalog = defineCatalog({
  Hero: { schema: heroSchema, ui: { fields: { price: { data: "request" } } } },
  Card: { schema: cardSchema },
});

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

const validDoc = doc({
  n1: { id: "n1", block: "Hero", props: { title: "T", price: 10 }, slots: { items: ["n2"] } },
  n2: { id: "n2", block: "Card", props: { label: "L" } },
});

const heroOnlyDoc = doc({
  n1: { id: "n1", block: "Hero", props: { title: "T", price: 10 } },
});

const docWithTwoBadNodes = doc({
  n1: { id: "n1", block: "Hero", props: { title: 5, price: 10 }, slots: { items: ["n2"] } },
  n2: { id: "n2", block: "Card", props: { label: 7 } },
});

describe("compile", () => {
  test("compiles a valid document into an artifact with a stable hash", () => {
    const artifact = compile(validDoc, catalog, registry, "/promotions/summer");
    expect(artifact.route).toBe("/promotions/summer");
    expect(artifact.registryFingerprint).toBe(registry.fingerprint());
    expect(artifact.blockVersions).toEqual({ Hero: 1, Card: 1 });
    expect(artifact.compiledWith).toBe(NUBBIN_VERSION);
    expect(compile(validDoc, catalog, registry, "/promotions/summer").hash).toBe(artifact.hash);
  });

  test("freezes static fields into props and leaves request fields as holes", () => {
    const artifact = compile(validDoc, catalog, registry, "/x");
    expect(artifact.tree[0]?.props).toEqual({ title: "T" });
    expect(artifact.tree[0]?.holes).toEqual({ price: "request" });
  });

  test("takes a nested data hint's leaf as a hole and leaves the rest of its parent frozen", () => {
    const bannerSchema = z.object({
      title: z.string(),
      cta: z.object({ label: z.string(), href: z.string() }),
    });
    const bannerRegistry = createRegistry([
      defineBlock({ name: "Banner", schema: bannerSchema, component: null, version: 1, slots: {} }),
    ]);
    const bannerCatalog = defineCatalog({
      Banner: { schema: bannerSchema, ui: { fields: { "cta.label": { data: "request" } } } },
    });
    const bannerDoc = doc({
      n1: {
        id: "n1",
        block: "Banner",
        props: { title: "T", cta: { label: "Go", href: "/x" } },
      },
    });

    const artifact = compile(bannerDoc, bannerCatalog, bannerRegistry, "/x");
    expect(artifact.tree[0]?.props).toEqual({ title: "T", cta: { href: "/x" } });
    expect(artifact.tree[0]?.holes).toEqual({ "cta.label": "request" });
  });

  test("throws one CompileError carrying every issue, not the first", () => {
    try {
      compile(docWithTwoBadNodes, catalog, registry, "/x");
      expect.unreachable("compile should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(CompileError);
      expect((error as CompileError).issues.length).toBeGreaterThan(1);
      expect((error as CompileError).issues[0]).toHaveProperty("nodeId");
      expect((error as CompileError).issues[0]).toHaveProperty("path");
    }
  });

  test("records only the block versions the document actually uses", () => {
    const artifact = compile(heroOnlyDoc, catalog, registry, "/x");
    expect(artifact.blockVersions).toEqual({ Hero: 1 });
  });
});
