#!/usr/bin/env node
// Prints a compact index of every document — path, status, and a one-line summary — so an
// agent or a new contributor can see what exists without reading it all.
//
// Derived, never committed. A checked-in catalog conflicts on every branch that adds a file
// and goes stale between regenerations; this reads frontmatter that lives beside the content
// it describes, so there is nothing separate to drift.
//
// Usage: node scripts/docs-catalog.mjs [--json]

import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SCAN_ROOTS = ["docs", ".claude/rules"];

/** Minimal frontmatter reader — `key: value` pairs between the leading `---` fences. */
export function readFrontmatter(text) {
  const match = /^---\n([\s\S]*?)\n---/.exec(text);
  if (!match) return {};
  const fields = {};
  for (const line of match[1].split("\n")) {
    const pair = /^([a-zA-Z][\w-]*):\s*(.*)$/.exec(line);
    if (pair) fields[pair[1]] = pair[2].replace(/^["']|["']$/g, "").trim();
  }
  return fields;
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
  if (existsSync(full)) await walk(full, files);
}
files.sort();

const rows = [];
for (const file of files) {
  const meta = readFrontmatter(await readFile(file, "utf8"));
  rows.push({
    path: relative(ROOT, file),
    status: meta.status ?? "—",
    summary: meta.summary ?? "(no summary — add frontmatter)",
  });
}

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
}

const pathWidth = Math.max(...rows.map((row) => row.path.length));
const statusWidth = Math.max(...rows.map((row) => row.status.length));
for (const row of rows) {
  console.log(`${row.path.padEnd(pathWidth)}  ${row.status.padEnd(statusWidth)}  ${row.summary}`);
}
console.log(`\n${rows.length} documents.`);
