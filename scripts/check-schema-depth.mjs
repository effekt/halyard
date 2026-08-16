#!/usr/bin/env node
// Rejects nested schema-object literals: a `z.object({…})` declared inside another
// `object(…)` call is a sub-schema that should be its own named, exported, reusable unit.
//
// This closes a hole every other gate leaves open. A 90-line schema is ONE declaration
// with ZERO branching, so cognitive complexity scores 0, `noExcessiveLinesPerFunction`
// doesn't apply (it isn't a function), and `check-single-export` counts one unit. It sails
// through while being exactly the kind of god-object the rules exist to prevent.
//
// It is also where the duplication lives: five blocks each inlining the same `{ label,
// href }` CTA shape is five copies that drift independently. Extracted once as
// `ctaSchema`, it is imported five times and changed in one place.
//
// Validator-agnostic — matches any callee named `object` (zod, valibot, arktype's `type`
// wrappers), so it works whatever a consumer brings.
//
// Usage: node scripts/check-schema-depth.mjs <files...> [--check]

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const args = process.argv.slice(2);
const CHECK = args.includes("--check");
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const SCAN_ROOTS = ["packages", "apps", "examples"];
const EXCLUDED_DIRS = new Set(["node_modules", "dist", ".next", ".turbo", ".repomix"]);

/** Every source file under the workspace roots, for when no explicit paths are given. */
function walkSources(dir, found) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const entry of entries) {
    if (EXCLUDED_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walkSources(full, found);
    else if (/\.tsx?$/.test(entry.name)) found.push(full);
  }
  return found;
}

/**
 * Passing no paths used to scan nothing and report success, so `pnpm verify` ran this gate
 * against zero files. An empty run is now a full run.
 */
function defaultTargets() {
  const found = [];
  for (const root of SCAN_ROOTS) walkSources(join(REPO_ROOT, root), found);
  return found;
}

const explicit = args.filter((arg) => !arg.startsWith("--"));
const files = explicit.length > 0 ? explicit : defaultTargets();

const EXEMPT_PATTERNS = [/\.test\.tsx?$/, /\/__tests__\//, /\/fixtures\//, /\.d\.ts$/];
const isExempt = (file) => EXEMPT_PATTERNS.some((pattern) => pattern.test(file));

/** True for `z.object(…)`, `v.object(…)`, or a bare `object(…)` — whatever validator. */
function isObjectSchemaCall(node) {
  if (!ts.isCallExpression(node)) return false;
  const { expression } = node;
  if (ts.isPropertyAccessExpression(expression)) return expression.name.text === "object";
  return ts.isIdentifier(expression) && expression.text === "object";
}

/** Line number of a node, for the report. */
function lineOf(source, node) {
  return source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
}

/** Every object-schema call that sits inside another one. */
function nestedObjectCalls(source) {
  const nested = [];

  const visit = (node, depth) => {
    const isSchema = isObjectSchemaCall(node);
    if (isSchema && depth > 0) nested.push(lineOf(source, node));
    ts.forEachChild(node, (child) => visit(child, isSchema ? depth + 1 : depth));
  };

  visit(source, 0);
  return nested;
}

const offenders = [];
for (const file of files) {
  if (isExempt(file) || !existsSync(file) || !/\.tsx?$/.test(file)) continue;
  const source = ts.createSourceFile(
    file,
    readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const lines = nestedObjectCalls(source);
  if (lines.length > 0) offenders.push({ file, lines });
}

if (offenders.length === 0) {
  console.log(`✅ No nested schema objects in ${files.length} checked file(s).`);
  process.exit(0);
}

console.log(
  `❌ ${offenders.length} file(s) inline a nested schema object. Extract each one into its\n` +
    `   own \`<name>.schema.ts\`, export it, and reference it by name — a nested shape is a\n` +
    `   sub-schema, and inlining it is how the same shape ends up copied across blocks.\n`,
);
for (const { file, lines } of offenders) {
  console.log(`  ${file}`);
  console.log(`        nested object schema at line(s): ${lines.join(", ")}\n`);
}

process.exit(CHECK ? 1 : 0);
