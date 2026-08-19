import { zodAdapter } from "@nubbin/core";
import { describe, expect, test } from "vitest";
import { proseSchema } from "./Prose.schema";
import { proseDefaults } from "./proseDefaults";

const bodyOf = (body: unknown) => ({ ...proseDefaults, body });

describe("proseSchema", () => {
  test("accepts the defaults, whose second paragraph links a word inside a sentence", () => {
    const parsed = proseSchema.safeParse(proseDefaults);

    expect(parsed.success).toBe(true);
    expect(parsed.data).toEqual(proseDefaults);
  });

  test("rejects a paragraph carrying markup in a string, which is what this replaces", () => {
    const body = [{ kind: "paragraph", spans: [{ text: 'see <a href="/security">security</a>' }] }];

    expect(proseSchema.safeParse(bodyOf(body)).success).toBe(true);
    expect(proseSchema.safeParse(bodyOf(['<a href="/security">security</a>'])).success).toBe(false);
  });

  test.each([
    ["an unknown mark", [{ kind: "paragraph", spans: [{ text: "x", marks: ["blink"] }] }]],
    ["an unknown kind", [{ kind: "heading", spans: [] }]],
    ["a non-string text", [{ kind: "paragraph", spans: [{ text: 7 }] }]],
    ["a plain string where a block belongs", ["just a sentence"]],
  ])("rejects %s", (_case, body) => {
    expect(proseSchema.safeParse(bodyOf(body)).success).toBe(false);
  });

  test("addresses a rejection at the span it came from, so the inspector can point at it", () => {
    const parsed = proseSchema.safeParse(
      bodyOf([{ kind: "paragraph", spans: [{ text: "x", marks: ["blink"] }] }]),
    );

    expect(parsed.success).toBe(false);
    expect(parsed.error?.issues[0]?.path).toEqual(["body", 0, "spans", 0, "marks", 0]);
  });

  test("describes the field tree the studio reads, rich text included", () => {
    expect(zodAdapter.describe(proseSchema)).toEqual([
      { path: "heading", kind: "string", optional: false },
      { path: "tone", kind: "enum", optional: false, members: ["light", "dark"] },
      { path: "body", kind: "array", optional: false },
      { path: "body[]", kind: "object", optional: false },
      { path: "body[].kind", kind: "enum", optional: false, members: ["paragraph", "listItem"] },
      { path: "body[].spans", kind: "array", optional: false },
      { path: "body[].spans[]", kind: "object", optional: false },
      { path: "body[].spans[].text", kind: "string", optional: false },
      { path: "body[].spans[].marks", kind: "array", optional: true },
      {
        path: "body[].spans[].marks[]",
        kind: "enum",
        optional: false,
        members: ["strong", "em", "code"],
      },
      { path: "body[].spans[].href", kind: "string", optional: true },
    ]);
  });
});
