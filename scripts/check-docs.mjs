#!/usr/bin/env node
// Structural integrity for documentation: links resolve, anchors exist, fences balance, and
// the index matches what is on disk.
//
// Documentation rots differently from code. A stale sentence compiles, passes every lint,
// and reads as authoritative — the only signal is a reader acting on it. These are the
// failures a machine can see; terminology drift is the other half, and lives in
// `check-superseded.mjs`.
//
// Usage: node scripts/check-docs.mjs [--check]

import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SCAN_ROOTS = [
  "docs",
  ".claude/rules",
  ".claude/skills",
  "README.md",
  "AGENTS.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "CODE_OF_CONDUCT.md",
];
const INDEX = join(ROOT, "docs/README.md");
const INDEXED_DIR = join(ROOT, "docs");

/**
 * GitHub's heading-to-anchor rule. Each space becomes one hyphen and runs are *not*
 * collapsed — a removed em-dash leaves the spaces that surrounded it, so
 * "Node — flat" anchors as "node--flat". Collapsing here silently accepts broken links.
 */
function slugify(heading) {
  return heading
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/ /g, "-");
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

const files = [];
for (const root of SCAN_ROOTS) {
  const full = join(ROOT, root);
  if (!existsSync(full)) continue;
  if (full.endsWith(".md")) files.push(full);
  else await walk(full, files);
}

const headings = new Map();
const bodies = new Map();
for (const file of files) {
  const text = await readFile(file, "utf8");
  bodies.set(file, text);
  const slugs = new Set();
  for (const line of text.split("\n")) {
    const match = /^#{1,6}\s+(.*)$/.exec(line);
    if (match) slugs.add(slugify(match[1]));
  }
  headings.set(file, slugs);
}

const problems = [];

for (const [file, text] of bodies) {
  const rel = relative(ROOT, file);

  const fences = (text.match(/^```/gm) ?? []).length;
  if (fences % 2 !== 0) problems.push(`${rel}  unbalanced code fences (${fences})`);

  for (const match of text.matchAll(/\]\((?!https?:|mailto:|#)([^)\s]+)\)/g)) {
    const [target, anchor] = match[1].split("#");
    if (!target.endsWith(".md")) continue;
    const resolved = resolve(dirname(file), target);
    if (!existsSync(resolved)) {
      problems.push(`${rel}  link to missing file: ${target}`);
      continue;
    }
    if (anchor && headings.has(resolved) && !headings.get(resolved).has(anchor)) {
      problems.push(`${rel}  link to missing anchor: ${target}#${anchor}`);
    }
  }

  for (const match of text.matchAll(/\]\(#([^)\s]+)\)/g)) {
    if (!headings.get(file).has(match[1])) {
      problems.push(`${rel}  link to missing local anchor: #${match[1]}`);
    }
  }
}

if (existsSync(INDEX)) {
  const indexText = bodies.get(INDEX) ?? "";
  const onDisk = (await readdir(INDEXED_DIR))
    .filter((name) => name.endsWith(".md") && name !== "README.md")
    .sort();
  for (const name of onDisk) {
    if (!indexText.includes(`(${name})`)) {
      problems.push(`docs/README.md  missing from the index: ${name}`);
    }
  }
}

if (problems.length === 0) {
  console.log(`✅ Docs structurally sound — ${files.length} file(s) checked.`);
  process.exit(0);
}

console.log(`❌ ${problems.length} documentation problem(s):\n`);
for (const problem of problems) console.log(`  ${problem}`);
console.log("");
process.exit(process.argv.includes("--check") ? 1 : 0);
