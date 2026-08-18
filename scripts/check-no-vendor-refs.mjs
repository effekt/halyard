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

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { trackedFiles } from "./trackedFiles.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TERMS_FILE = join(ROOT, "scripts/vendor-terms.txt");

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

function collectTargets(explicit) {
  if (explicit.length > 0) return explicit.map((file) => resolve(ROOT, file)).filter(existsSync);
  return trackedFiles(ROOT).map((path) => join(ROOT, path));
}

/** The denylist is the one file allowed to contain every denied term. */
const isTermsFile = (file) => resolve(file) === TERMS_FILE;

const args = process.argv.slice(2);
const check = args.includes("--check");
const patterns = [...ALWAYS_DENIED, ...(await loadTerms())];
const targets = collectTargets(args.filter((arg) => !arg.startsWith("--"))).filter(
  (file) => !file.endsWith("check-no-vendor-refs.mjs") && !isTermsFile(file),
);

const hits = [];
for (const file of targets) {
  const raw = await readFile(file);
  // A file the extension test could not name as binary still may be — skip on the first NUL
  // byte rather than pattern-matching mojibake.
  if (raw.includes(0)) continue;
  const lines = raw.toString("utf8").split("\n");
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
