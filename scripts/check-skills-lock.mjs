#!/usr/bin/env node

// Fails when `skills-lock.json` and the installed skills disagree, by name or by content.
//
// The lockfile is the only committed record of which third-party skills this repository is
// worked on with — the skills themselves are ignored, because they are someone else's work
// and they arrive as symlinks. That makes the lockfile a claim about an environment nobody
// can see from the repository, and an unverified claim drifts three ways: an entry for a
// skill nobody installed sends a contributor to fetch something the work never used, an
// installed skill missing from the lockfile is a result nobody else can reproduce, and a
// skill whose text has changed under a name that still matches is the one that changes what
// an agent produces while looking identical.
//
// `contentHash` is ours and this script maintains it. The `computedHash` beside it belongs to
// the skills CLI and is computed over upstream source before install-time transformation —
// it does not equal the hash of the file on disk, so this script neither writes nor verifies
// it. Recording our own hash of the installed text is what makes content drift detectable
// without reimplementing someone else's algorithm.
//
// Skips silently where the skills directory is absent. A fresh clone and CI both run without
// skills installed, and failing there would make the gate mean "you have not set up your
// machine" rather than "the record is wrong".
//
// Usage: node scripts/check-skills-lock.mjs [--check] [--write]

import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const LOCKFILE = join(ROOT, "skills-lock.json");
const SKILLS_DIR = join(ROOT, ".agents", "skills");
const SKILL_FILE = "SKILL.md";

async function readLock() {
  return JSON.parse(await readFile(LOCKFILE, "utf8"));
}

async function installedNames() {
  const entries = await readdir(SKILLS_DIR, { withFileTypes: true });
  return entries.filter((entry) => !entry.name.startsWith(".")).map((entry) => entry.name);
}

/** sha256 of the installed skill text, or null where the skill has no SKILL.md. */
async function contentHashOf(name) {
  const file = join(SKILLS_DIR, name, SKILL_FILE);
  if (!existsSync(file)) return null;
  return createHash("sha256")
    .update(await readFile(file))
    .digest("hex");
}

function report(heading, rows, remedy) {
  if (rows.length === 0) return;
  console.log(`  ${heading}`);
  for (const row of rows.sort()) console.log(`        ${row}`);
  console.log(`        → ${remedy}\n`);
}

if (!existsSync(SKILLS_DIR)) {
  console.log("✅ No skills installed — nothing to compare against skills-lock.json.");
  process.exit(0);
}

const lock = await readLock();
const skills = lock.skills ?? {};
const locked = new Set(Object.keys(skills));
const installed = new Set(await installedNames());

if (process.argv.includes("--write")) {
  for (const name of installed) {
    if (!skills[name]) continue;
    const hash = await contentHashOf(name);
    if (hash !== null) skills[name].contentHash = hash;
  }
  await writeFile(LOCKFILE, `${JSON.stringify(lock, null, 2)}\n`);
  console.log(`✅ Recorded contentHash for ${installed.size} installed skill(s).`);
  process.exit(0);
}

const missing = [...locked].filter((name) => !installed.has(name));
const unrecorded = [...installed].filter((name) => !locked.has(name));
const unhashed = [];
const changed = [];

for (const name of [...locked].filter((entry) => installed.has(entry))) {
  const actual = await contentHashOf(name);
  if (actual === null) {
    unhashed.push(`${name} — no ${SKILL_FILE}`);
    continue;
  }
  const recorded = skills[name].contentHash;
  if (recorded === undefined) unhashed.push(`${name} — no contentHash recorded`);
  else if (recorded !== actual)
    changed.push(`${name}  recorded ${recorded.slice(0, 12)}…  on disk ${actual.slice(0, 12)}…`);
}

if (missing.length + unrecorded.length + unhashed.length + changed.length === 0) {
  console.log(
    `✅ skills-lock.json matches ${installed.size} installed skill(s), name and content.`,
  );
  process.exit(0);
}

console.log("❌ skills-lock.json and the installed skills disagree.\n");
report("Recorded but not installed:", missing, "install it, or drop the entry");
report("Installed but not recorded:", unrecorded, "add it to the lockfile, then run --write");
report(
  "Content differs from the lockfile:",
  changed,
  "reinstall it, or run --write if the change is intended",
);
report("Cannot be verified:", unhashed, "run --write to record a hash for it");

process.exit(process.argv.includes("--check") ? 1 : 0);
