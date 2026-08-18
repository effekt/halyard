#!/usr/bin/env node

// Rejects plan-shaped files committed under `docs/`.
//
// A plan is a description of work not yet done. As a file it has no close condition: nobody
// deletes it when the work lands and nobody updates it when the work changes shape, so a
// later reader cannot tell a record of what happened from a proposal that was abandoned. An
// issue closes, which is the whole argument — see `.claude/rules/planning.md`.
//
// Skills arrive with their own conventions and `superpowers:writing-plans` writes to
// `docs/superpowers/plans/YYYY-MM-DD-<name>.md` by default, so the shapes below are the ones
// a tool produces without being asked, not hypotheses about what someone might type.
//
// Usage: node scripts/check-plan-files.mjs [files...] [--check]

import { readdir } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = join(ROOT, "docs");

/**
 * Each names a shape a plan arrives in. Kept narrow deliberately: a document *about* planning
 * is legitimate, so the word alone is not the signal — a `plans/` directory, a date-stamped
 * filename, or a stem that is the word itself are.
 */
const PLAN_SHAPES = [
  { test: (rel) => rel.split("/").includes("plans"), why: "a `plans/` directory" },
  { test: (_rel, base) => /^\d{4}-\d{2}-\d{2}[-.]/.test(base), why: "a date-stamped filename" },
  { test: (_rel, base) => /^plan(-|\.)|(-plan)\.md$/.test(base), why: "a filename that is a plan" },
];

async function walk(dir, found) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, found);
    else if (entry.name.endsWith(".md")) found.push(full);
  }
  return found;
}

const args = process.argv.slice(2);
const check = args.includes("--check");
const explicit = args.filter((arg) => !arg.startsWith("--")).map((file) => resolve(ROOT, file));
const files = explicit.length > 0 ? explicit : await walk(DOCS, []);

const inDocs = files.filter((file) => file.startsWith(`${DOCS}/`));
const problems = [];
for (const file of inDocs) {
  const rel = relative(ROOT, file);
  const base = rel.split("/").pop();
  const shape = PLAN_SHAPES.find((candidate) => candidate.test(rel, base));
  if (shape) problems.push(`${rel}  ${shape.why} — a plan is an issue, because an issue closes`);
}

if (problems.length === 0) {
  console.log(`✅ No plan-shaped files — ${inDocs.length} document(s) under docs/ checked.`);
  process.exit(0);
}

console.log(`❌ ${problems.length} plan-shaped file(s) under docs/.\n`);
for (const problem of problems) console.log(`  ${problem}`);
console.log("");
process.exit(check ? 1 : 0);
