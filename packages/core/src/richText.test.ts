import { describe, expect, test } from "vitest";
import { zodAdapter } from "./adapters/zodAdapter";
import { CompileError } from "./CompileError";
import { compile } from "./compile";
import { createRegistry } from "./createRegistry";
import { defineBlock } from "./defineBlock";
import { defineCatalog } from "./defineCatalog";
import type { DocumentVersion } from "./document.types";
import { richText } from "./richText";
import { standardValidate } from "./standardValidate";

const schema = richText();

const issuesOf = (value: unknown): { message: string; path: string }[] => {
  const result = standardValidate(schema, value);
  return (result.issues ?? []).map((issue) => ({
    message: issue.message,
    path: (issue.path ?? []).map(String).join("."),
  }));
};

const paragraph = [{ kind: "paragraph", spans: [{ text: "Plain." }] }];

describe("richText validation", () => {
  test("accepts an ordered array of blocks whose spans carry marks and an href", () => {
    const value = [
      {
        kind: "paragraph",
        spans: [
          { text: "How we keep that safe is on our " },
          { text: "security page", href: "/security" },
          { text: ", not in a PDF.", marks: ["strong", "em"] },
        ],
      },
      { kind: "listItem", spans: [{ text: "encrypted", marks: ["code"] }] },
    ];
    const result = schema["~standard"].validate(value);

    expect(result.issues).toBeUndefined();
    expect(result.issues === undefined ? result.value : undefined).toEqual(value);
  });

  test("accepts an empty document", () => {
    expect(standardValidate(schema, []).issues).toBeUndefined();
  });

  test("rejects a span carrying a mark outside the closed set", () => {
    expect(issuesOf([{ kind: "paragraph", spans: [{ text: "x", marks: ["blink"] }] }])).toEqual([
      {
        path: "0.spans.0.marks.0",
        message: 'unknown mark "blink"; expected one of strong, em, code',
      },
    ]);
  });

  test("rejects a block whose kind is outside the closed set", () => {
    expect(issuesOf([{ kind: "heading", spans: [] }])).toEqual([
      {
        path: "0.kind",
        message: 'unknown kind "heading"; expected one of paragraph, listItem',
      },
    ]);
  });

  test("rejects a span whose text is not a string", () => {
    expect(issuesOf([{ kind: "paragraph", spans: [{ text: 7 }] }])).toEqual([
      { path: "0.spans.0.text", message: "text must be a string" },
    ]);
  });

  test("rejects markup smuggled in as an extra key rather than accepting it silently", () => {
    expect(issuesOf([{ kind: "paragraph", spans: [{ text: "x", html: "<b>x</b>" }] }])).toEqual([
      { path: "0.spans.0.html", message: 'unexpected key "html"' },
    ]);
  });

  test("rejects a value that is not an array of blocks", () => {
    expect(issuesOf("<p>hello</p>")).toEqual([
      { path: "", message: "rich text must be an array of blocks" },
    ]);
  });

  test("rejects a non-string href and a spans list that is not an array", () => {
    expect(issuesOf([{ kind: "paragraph", spans: { text: "x" } }])).toEqual([
      { path: "0.spans", message: "spans must be an array" },
    ]);
    expect(issuesOf([{ kind: "paragraph", spans: [{ text: "x", href: 3 }] }])).toEqual([
      { path: "0.spans.0.href", message: "href must be a string" },
    ]);
  });
});

describe("the JSON Schema projection", () => {
  test("describes the field tree the studio reads, with the closed sets as members", () => {
    expect(zodAdapter.describe(schema)).toEqual([
      { path: "[]", kind: "object", optional: false },
      { path: "[].kind", kind: "enum", optional: false, members: ["paragraph", "listItem"] },
      { path: "[].spans", kind: "array", optional: false },
      { path: "[].spans[]", kind: "object", optional: false },
      { path: "[].spans[].text", kind: "string", optional: false },
      { path: "[].spans[].marks", kind: "array", optional: true },
      {
        path: "[].spans[].marks[]",
        kind: "enum",
        optional: false,
        members: ["strong", "em", "code"],
      },
      { path: "[].spans[].href", kind: "string", optional: true },
    ]);
  });
});

/** A block schema built without a validator, so the round-trip below exercises `core` alone:
 * zod cannot hold a foreign Standard Schema in an object shape, and the demo's `Prose` block
 * carries the zod-side host for that. */
const bodySchema = {
  "~standard": {
    version: 1 as const,
    vendor: "test",
    validate: (value: unknown) => {
      const body = (value as { body?: unknown } | null)?.body;
      const result = standardValidate(schema, body);
      if (result.issues === undefined) return { value: { body: result.value } };
      return {
        issues: result.issues.map((issue) => ({
          message: issue.message,
          path: ["body", ...(issue.path ?? [])],
        })),
      };
    },
  },
};

const prose = defineBlock({
  name: "Prose",
  schema: bodySchema,
  component: null,
  version: 1,
  slots: {},
});

describe("rich text through compile", () => {
  const registry = createRegistry([prose]);
  const catalog = defineCatalog({ Prose: { schema: bodySchema } });
  const documentWith = (body: unknown): DocumentVersion => ({
    documentId: "d1",
    version: 1,
    roots: ["n1"],
    elements: { n1: { id: "n1", block: "Prose", props: { body } } },
    meta: { title: "t" },
    createdAt: "2026-01-01T00:00:00Z",
    createdBy: "test",
  });

  test("freezes a nested rich-text value into the artifact unchanged", () => {
    const artifact = compile(documentWith(paragraph), catalog, registry, "/about");

    expect(artifact.tree[0]?.props).toEqual({ body: paragraph });
    expect(compile(documentWith(paragraph), catalog, registry, "/about").hash).toBe(artifact.hash);
  });

  test("refuses to compile a document whose rich text carries an unknown mark", () => {
    const bad = [{ kind: "paragraph", spans: [{ text: "x", marks: ["blink"] }] }];

    expect(() => compile(documentWith(bad), catalog, registry, "/about")).toThrow(CompileError);
  });
});
