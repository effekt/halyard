// Rejects nested schema-object literals: a `z.object({…})` declared inside another `object(…)`
// call is a sub-schema that should be its own named, exported, reusable unit.
//
// This closes a hole every other gate leaves open. A 90-line schema is ONE declaration with ZERO
// branching, so cognitive complexity scores 0, `noExcessiveLinesPerFunction` doesn't apply (it
// isn't a function), and one-unit-per-file counts one unit. It sails through while being exactly
// the kind of god-object the rules exist to prevent.
//
// It is also where the duplication lives: five blocks each inlining the same `{ label, href }` CTA
// shape is five copies that drift independently. Extracted once as `ctaSchema`, it is imported
// five times and changed in one place.
//
// Validator-agnostic — matches any callee named `object` (zod, valibot, arktype's `type` wrappers),
// so it works whatever a consumer brings.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";
import { REPO_ROOT } from "./support/repoRoot.mjs";
import { sourceFiles } from "./support/sourceFiles.mjs";

const EXEMPT = [/\.test\.tsx?$/, /\/__tests__\//, /\/fixtures\//];

/** True for `z.object(…)`, `v.object(…)`, or a bare `object(…)` — whatever validator. */
function isObjectSchemaCall(node) {
  if (!ts.isCallExpression(node)) return false;
  const { expression } = node;
  if (ts.isPropertyAccessExpression(expression)) return expression.name.text === "object";
  return ts.isIdentifier(expression) && expression.text === "object";
}

/** The lines of every object-schema call that sits inside another one. */
function nestedSchemaLines(file, text) {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const nested = [];
  const visit = (node, depth) => {
    const isSchema = isObjectSchemaCall(node);
    if (isSchema && depth > 0) {
      nested.push(source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1);
    }
    ts.forEachChild(node, (child) => visit(child, isSchema ? depth + 1 : depth));
  };
  visit(source, 0);
  return nested;
}

describe("the detector", () => {
  it("sees a sub-schema inlined inside another", () => {
    const text = [
      "export const heroSchema = z.object({",
      "  title: z.string(),",
      "  cta: z.object({ label: z.string(), href: z.string() }),",
      "});",
    ].join("\n");
    expect(nestedSchemaLines("hero.schema.ts", text)).toEqual([3]);
  });

  it("passes a schema that references a named sub-schema", () => {
    const text = "export const heroSchema = z.object({ title: z.string(), cta: ctaSchema });\n";
    expect(nestedSchemaLines("hero.schema.ts", text)).toEqual([]);
  });

  it("is validator-agnostic", () => {
    const text = "export const s = object({ a: object({ b: string() }) });\n";
    expect(nestedSchemaLines("s.schema.ts", text)).toEqual([1]);
  });

  it("reads .tsx as well as .ts — a language split here is a silent blind spot", () => {
    const text = "export const s = z.object({ a: z.object({ b: z.string() }) });\n";
    expect(nestedSchemaLines("s.tsx", text)).toEqual([1]);
  });
});

describe("every source file", () => {
  it("inlines no nested schema object", () => {
    const files = sourceFiles().filter((path) => !EXEMPT.some((pattern) => pattern.test(path)));
    expect(files.length).toBeGreaterThan(20);
    const offenders = [];
    for (const rel of files) {
      const lines = nestedSchemaLines(rel, readFileSync(join(REPO_ROOT, rel), "utf8"));
      if (lines.length > 0)
        offenders.push(`${rel}  nested object schema at line(s): ${lines.join(", ")}`);
    }
    expect(offenders).toEqual([]);
  });
});
