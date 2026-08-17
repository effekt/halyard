#!/usr/bin/env node

// Fails when `skills-lock.json` and the installed skills disagree.
//
// The lockfile is the only committed record of which third-party skills this repository is
// worked on with — the skills themselves are ignored, because they are someone else's work
// and they arrive as symlinks. That makes the lockfile a claim about an environment nobody
// can see from the repository, and an unverified claim drifts in both directions: an entry
// for a skill nobody installed sends a contributor to fetch something the work never used,
// and an installed skill missing from the lockfile is a result nobody else can reproduce.
//
// Skips silently where the skills directory is absent. A fresh clone and CI both run without
// skills installed, and failing there would make the gate mean "you have not set up your
// machine" rather than "the record is wrong".
//
// Usage: node scripts/check-skills-lock.mjs [--check]

import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const LOCKFILE = join(ROOT, "skills-lock.json");
const SKILLS_DIR = join(ROOT, ".agents", "skills");

async function lockedNames() {
  const lock = JSON.parse(await readFile(LOCKFILE, "utf8"));
  return Object.keys(lock.skills ?? {});
}

async function installedNames() {
  const entries = await readdir(SKILLS_DIR, { withFileTypes: true });
  return entries.filter((entry) => !entry.name.startsWith(".")).map((entry) => entry.name);
}

function report(heading, names, remedy) {
  if (names.length === 0) return;
  console.log(`  ${heading}`);
  for (const name of names.sort()) console.log(`        ${name}`);
  console.log(`        → ${remedy}\n`);
}

if (!existsSync(SKILLS_DIR)) {
  console.log("✅ No skills installed — nothing to compare against skills-lock.json.");
  process.exit(0);
}

const locked = new Set(await lockedNames());
const installed = new Set(await installedNames());

const missing = [...locked].filter((name) => !installed.has(name));
const unrecorded = [...installed].filter((name) => !locked.has(name));

if (missing.length === 0 && unrecorded.length === 0) {
  console.log(`✅ skills-lock.json matches ${installed.size} installed skill(s).`);
  process.exit(0);
}

console.log("❌ skills-lock.json and the installed skills disagree.\n");
report("Recorded but not installed:", missing, "install it, or drop the entry");
report("Installed but not recorded:", unrecorded, "add it to the lockfile with its hash");

process.exit(process.argv.includes("--check") ? 1 : 0);
