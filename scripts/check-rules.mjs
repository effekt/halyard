#!/usr/bin/env node

// Enforces the contract `.claude/rules/writing-rules.md` states for rule files.
//
// Rule files are the one place in this repository where a written rule had no gate at all —
// including the rule about writing rules. The result was predictable: a file drifted two lines
// past its own stated cap and nothing noticed, because the only reader who would catch it is
// the one who already knows the cap exists.
//
// A rule file is read by an agent on every matching edit, so its cost is paid repeatedly. The
// caps here are about that cost, not about tidiness.
//
// Usage: node scripts/check-rules.mjs [files...] [--check]

import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RULES_DIR = join(ROOT, ".claude/rules");
const MAX_LINES = 150;
const REQUIRED_KEYS = ["paths", "title", "summary", "status"];

/** Frontmatter as raw key/value pairs; a rule file's frontmatter is always flat. */
function frontmatter(text) {
  const lines = text.split("\n");
  if (lines[0]?.trim() !== "---") return null;
  const end = lines.indexOf("---", 1);
  if (end === -1) return null;
  const keys = new Map();
  for (const line of lines.slice(1, end)) {
    const match = /^([a-z]+):\s*(.*)$/.exec(line);
    if (match) keys.set(match[1], match[2].trim());
  }
  return keys;
}

async function collectTargets(explicit) {
  if (explicit.length > 0) return explicit.map((file) => resolve(ROOT, file)).filter(existsSync);
  if (!existsSync(RULES_DIR)) return [];
  const entries = await readdir(RULES_DIR);
  return entries.filter((name) => name.endsWith(".md")).map((name) => join(RULES_DIR, name));
}

const args = process.argv.slice(2);
const targets = (await collectTargets(args.filter((arg) => !arg.startsWith("--")))).filter((file) =>
  file.includes(`${RULES_DIR}/`),
);

const problems = [];
for (const file of targets) {
  const rel = relative(ROOT, file);
  const text = await readFile(file, "utf8");
  const lines = text.split("\n");
  const trailing = lines.at(-1) === "" ? 1 : 0;
  const count = lines.length - trailing;

  if (count > MAX_LINES) {
    problems.push(
      `${rel}  ${count} lines, cap is ${MAX_LINES} — split it, or cut what a gate already covers`,
    );
  }

  const keys = frontmatter(text);
  if (keys === null) {
    problems.push(`${rel}  no frontmatter`);
  } else {
    for (const key of REQUIRED_KEYS) {
      if (!keys.has(key) || keys.get(key) === "")
        problems.push(`${rel}  frontmatter missing: ${key}`);
    }
    // Without `paths` the rule loads at session start and spends context on every unrelated edit.
    if (keys.get("paths") === "") problems.push(`${rel}  empty paths glob`);
  }

  if (!/^##\s+Checklist\s*$/m.test(text)) {
    problems.push(`${rel}  no "## Checklist" section — a rule ends with what to verify`);
  }
}

if (problems.length === 0) {
  console.log(`✅ Rule files well-formed — ${targets.length} checked.`);
  process.exit(0);
}

console.log(`❌ ${problems.length} rule-file problem(s). See .claude/rules/writing-rules.md\n`);
for (const problem of problems) console.log(`  ${problem}`);
console.log("");
process.exit(args.includes("--check") ? 1 : 0);
