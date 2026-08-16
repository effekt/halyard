#!/usr/bin/env node
// Rejects terminology a decision has replaced.
//
// This is the failure mode documentation actually has. A decision renames something —
// one mutable manifest becomes per-route pointers, a block-level flag moves to field level —
// and every other document keeps describing the old shape. Nothing breaks. The prose still
// reads as authoritative, and the only signal is a reader acting on it.
//
// The list lives in `docs/superseded.md`, committed, because knowing what a thing used to be
// called is useful to a reader and essential to a reviewer. A decision that renames something
// adds a row in the same commit.
//
// Deliberate historical references are expected — a document that explains what changed has
// to name the old thing. Two escapes:
//   · put `<!-- superseded-ok -->` on the line
//   · write it under a heading containing "historical" or "superseded"
//
// Usage: node scripts/check-superseded.mjs [files...] [--check]

import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const LIST = join(ROOT, "docs/superseded.md");
const SCAN_ROOTS = [
  "docs",
  ".claude/rules",
  "AGENTS.md",
  "README.md",
  "CLAUDE.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "CODE_OF_CONDUCT.md",
];
const EXEMPT_LINE = /<!--\s*superseded-ok\s*-->/;
const HISTORICAL_HEADING = /^#{1,6}\s+.*\b(historical|superseded)\b/i;

/** Rows are `| `old` | new | why |` in the list's table; only the first two matter here. */
async function loadRules() {
  if (!existsSync(LIST)) return [];
  const text = await readFile(LIST, "utf8");
  const rules = [];
  for (const line of text.split("\n")) {
    const match = /^\|\s*`([^`]+)`\s*\|\s*([^|]+?)\s*\|/.exec(line);
    if (!match || match[1] === "Superseded") continue;
    rules.push({
      pattern: new RegExp(match[1].replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
      replacement: match[2].trim(),
    });
  }
  return rules;
}

async function walk(dir, found) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const entry of entries) {
    if (entry.name === "node_modules") continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, found);
    else if (entry.name.endsWith(".md")) found.push(full);
  }
  return found;
}

async function collectTargets(explicit) {
  if (explicit.length > 0) return explicit.map((file) => resolve(ROOT, file)).filter(existsSync);
  const found = [];
  for (const root of SCAN_ROOTS) {
    const full = join(ROOT, root);
    if (!existsSync(full)) continue;
    if (full.endsWith(".md")) found.push(full);
    else await walk(full, found);
  }
  return found;
}

const args = process.argv.slice(2);
const check = args.includes("--check");
const rules = await loadRules();
const targets = (await collectTargets(args.filter((arg) => !arg.startsWith("--")))).filter(
  (file) => file !== LIST,
);

const hits = [];
for (const file of targets) {
  const lines = (await readFile(file, "utf8")).split("\n");
  let historicalDepth = 0;

  lines.forEach((line, index) => {
    const heading = /^(#{1,6})\s/.exec(line);
    if (heading) {
      const depth = heading[1].length;
      if (HISTORICAL_HEADING.test(line)) historicalDepth = depth;
      else if (historicalDepth && depth <= historicalDepth) historicalDepth = 0;
    }
    if (historicalDepth || EXEMPT_LINE.test(line)) return;

    const rule = rules.find((candidate) => candidate.pattern.test(line));
    if (rule) {
      hits.push(`${relative(ROOT, file)}:${index + 1}  ${rule.pattern.source} → ${rule.replacement}`);
    }
  });
}

if (hits.length === 0) {
  const note = rules.length === 0 ? " (no superseded list)" : "";
  console.log(`✅ No superseded terminology in ${targets.length} file(s)${note}.`);
  process.exit(0);
}

console.log(
  `❌ ${hits.length} use(s) of superseded terminology. Update the prose, or mark a deliberate\n` +
    `   historical reference with <!-- superseded-ok --> or a "Historical" heading.\n`,
);
for (const hit of hits) console.log(`  ${hit}`);
console.log("");
process.exit(check ? 1 : 0);
