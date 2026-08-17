import { describe, expect, test } from "vitest";
import { z } from "zod";
import { zodAdapter } from "./zodAdapter";

const paths = (schema: unknown) => zodAdapter.describe(schema).map((f) => f.path);

describe("zodAdapter.describe", () => {
  test("reports scalar fields with their kind and optionality", () => {
    const fields = zodAdapter.describe(
      z.object({ title: z.string(), count: z.number(), draft: z.boolean().optional() }),
    );
    expect(fields).toEqual([
      { path: "title", kind: "string", optional: false },
      { path: "count", kind: "number", optional: false },
      { path: "draft", kind: "boolean", optional: true },
    ]);
  });

  test("reports an enum with its members, which the inspector renders as a closed set", () => {
    const [field] = zodAdapter.describe(z.object({ tone: z.enum(["light", "dark"]) }));
    expect(field).toEqual({
      path: "tone",
      kind: "enum",
      optional: false,
      members: ["light", "dark"],
    });
  });

  test("descends into a nested object using dotted paths", () => {
    expect(paths(z.object({ cta: z.object({ label: z.string(), href: z.string() }) }))).toEqual([
      "cta",
      "cta.label",
      "cta.href",
    ]);
  });

  test("marks array members with [] so a hint can target the row shape", () => {
    expect(paths(z.object({ items: z.array(z.object({ title: z.string() })) }))).toEqual([
      "items",
      "items[]",
      "items[].title",
    ]);
  });

  test("reports a discriminated union and the branches beneath it", () => {
    const schema = z.object({
      body: z.discriminatedUnion("kind", [
        z.object({ kind: z.literal("text"), value: z.string() }),
        z.object({ kind: z.literal("image"), url: z.string() }),
      ]),
    });
    const fields = zodAdapter.describe(schema);
    expect(fields.find((f) => f.path === "body")?.kind).toBe("union");
    expect(paths(schema)).toContain("body.value");
    expect(paths(schema)).toContain("body.url");
  });

  test("throws rather than degrading when it meets a type it cannot represent", () => {
    expect(() => zodAdapter.describe(z.object({ when: z.date() }))).toThrow(/date/i);
  });
});
