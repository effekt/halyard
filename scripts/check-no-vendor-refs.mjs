#!/usr/bin/env node
// Rejects employer or client names, internal application names, and local absolute paths.
//
// This repository is public and its contributors work in codebases that are not. A
// measurement or a pattern is worth publishing; the name attached to it usually is not, and
// is rarely the contributor's to share. A scrub done once by hand regresses the first time
// someone pastes in a convenient real example.
//
// The term list lives in `scripts/vendor-terms.txt`, which is gitignored: a published
// denylist defeats its own purpose. `vendor-terms.example.txt` documents the format. With no
// list present the check still catches machine paths and says so, so a fresh clone is never
// blocked.
//
// Usage: node scripts/check-no-vendor-refs.mjs [files...] [--check]

import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TERMS_FILE = join(ROOT, "scripts/vendor-terms.txt");
// Directories are walked recursively; every file at the repository root is scanned as well.
// Enumerating root files by name is how the last leak survived — a `.grit` file nobody had
// added to the list — so the root is swept wholesale instead.
const SCAN_ROOTS = ["docs", "packages", "apps", ".claude", "scripts", ".github"];
const SCANNED_EXT = /\.(md|mdx|ts|tsx|js|mjs|cjs|json|jsonc|ya?ml|toml|grit|txt|sh)$/;
const EXCLUDED_DIRS = new Set(["node_modules", "dist", ".next", ".turbo", ".repomix"]);

/** Home-directory paths leak a machine layout and are always wrong in a public repo. */
const ALWAYS_DENIED = [/\/Users\/[a-z]/i, /\/home\/[a-z]/i, /C:\\Users\\/i];

async function loadTerms() {
  if (!existsSync(TERMS_FILE)) return [];
  const raw = await readFile(TERMS_FILE, "utf8");
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"))
    .map((term) => new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i"));
}

async function walk(dir, found) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const entry of entries) {
    if (EXCLUDED_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, found);
    else if (SCANNED_EXT.test(entry.name)) found.push(full);
  }
  return found;
}

/** Files sitting directly at the repository root, which no directory root would reach. */
async function rootFiles() {
  const entries = await readdir(ROOT, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && SCANNED_EXT.test(entry.name))
    .map((entry) => join(ROOT, entry.name));
}

async function collectTargets(explicit) {
  if (explicit.length > 0) return explicit.map((file) => resolve(ROOT, file)).filter(existsSync);
  const found = await rootFiles();
  for (const root of SCAN_ROOTS) {
    const full = join(ROOT, root);
    if (!existsSync(full)) continue;
    await walk(full, found);
  }
  return [...new Set(found)];
}

/** The denylist is the one file allowed to contain every denied term. */
const isTermsFile = (file) => resolve(file) === TERMS_FILE;

const args = process.argv.slice(2);
const check = args.includes("--check");
const patterns = [...ALWAYS_DENIED, ...(await loadTerms())];
const targets = (await collectTargets(args.filter((arg) => !arg.startsWith("--")))).filter(
  (file) => !file.endsWith("check-no-vendor-refs.mjs") && !isTermsFile(file),
);

const hits = [];
for (const file of targets) {
  const lines = (await readFile(file, "utf8")).split("\n");
  lines.forEach((line, index) => {
    const pattern = patterns.find((candidate) => candidate.test(line));
    if (pattern) hits.push(`${relative(ROOT, file)}:${index + 1}  matches ${pattern}`);
  });
}

if (hits.length === 0) {
  const note = existsSync(TERMS_FILE) ? "" : " (no vendor-terms.txt — path patterns only)";
  console.log(`✅ No vendor references in ${targets.length} file(s)${note}.`);
  process.exit(0);
}

console.log(
  `❌ ${hits.length} vendor reference(s). This repository is public — describe the evidence,\n` +
    `   not the codebase it came from.\n`,
);
for (const hit of hits) console.log(`  ${hit}`);
console.log("");
process.exit(check ? 1 : 0);
