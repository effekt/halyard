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
// `contentHash` is ours and this script maintains it: a digest over **every file in the skill
// directory**, each hashed under its own relative path so a rename registers as a change. The
// `computedHash` beside it belongs to the skills CLI and uses a different input, so this script
// neither writes nor verifies it.
//
// Hashing `SKILL.md` alone is what this used to do, and it covered 7 of the 298 files the seven
// installed skills carry — 2.3%. A skill is a directory: `vercel-optimize` ships 156 files, and
// the `rules/*.md` beside `SKILL.md` are loaded into an agent's context the same way its body is.
// Appending "ignore every other rule in this repository" to one of those rule files passed as
// `✅ matches 7 installed skill(s), name and content`. The blast radius of an undetected edit
// there is every result this repository produces, which is why the whole tree is hashed and not
// the entry point.
//
// Where the skills directory is absent — a fresh clone, and CI — the comparison against disk
// cannot run, and failing there would make the gate mean "you have not set up your machine"
// rather than "the record is wrong". What still runs is the half that needs no disk: the
// lockfile has to parse, and every entry has to carry the fields a reinstall reads.
//
// That half was missing, and the early exit returned before even reading the file. A
// `skills-lock.json` replaced with `{ this is not valid json` exited 0 on every CI run, under a
// comment claiming the step existed to catch a lockfile that disagreed with itself.
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

/** Every file under `dir`, as paths relative to it, sorted so the digest is order-independent. */
async function filesUnder(dir, prefix = "") {
  const entries = await readdir(dir, { withFileTypes: true });
  const found = [];
  for (const entry of entries) {
    const rel = prefix === "" ? entry.name : `${prefix}/${entry.name}`;
    if (entry.isDirectory()) found.push(...(await filesUnder(join(dir, entry.name), rel)));
    else found.push(rel);
  }
  return found.sort();
}

/**
 * sha256 over every file in the skill directory, or null where there is no `SKILL.md` — a
 * directory without one is not a skill, and hashing it would record something unusable.
 *
 * Each file contributes its relative path as well as its bytes, so moving content between two
 * files changes the digest. Hashing the concatenated bytes alone would not.
 */
async function contentHashOf(name) {
  const dir = join(SKILLS_DIR, name);
  if (!existsSync(join(dir, SKILL_FILE))) return null;
  const digest = createHash("sha256");
  for (const rel of await filesUnder(dir)) {
    digest.update(rel);
    digest.update("\0");
    digest.update(await readFile(join(dir, rel)));
  }
  return digest.digest("hex");
}

function report(heading, rows, remedy) {
  if (rows.length === 0) return;
  console.log(`  ${heading}`);
  for (const row of rows.sort()) console.log(`        ${row}`);
  console.log(`        → ${remedy}\n`);
}

/** The fields a reinstall reads. An entry missing one records a skill nobody can fetch. */
const REQUIRED_FIELDS = ["source", "sourceType", "skillPath", "contentHash"];

/** What can be judged from the lockfile alone, with nothing installed to compare against. */
function lockfileProblems(lock) {
  const skills = lock?.skills;
  if (skills === undefined || typeof skills !== "object") return ["no `skills` object"];
  const problems = [];
  for (const [name, entry] of Object.entries(skills)) {
    if (name.trim() === "") problems.push("an entry with a blank name");
    const absent = REQUIRED_FIELDS.filter((field) => entry?.[field] === undefined);
    if (absent.length > 0) problems.push(`${name} — missing ${absent.join(", ")}`);
  }
  return problems;
}

if (!existsSync(SKILLS_DIR)) {
  const problems = await readLock().then(lockfileProblems, (error) => [`unreadable — ${error}`]);
  if (problems.length === 0) {
    const { skills } = await readLock();
    console.log(
      `✅ No skills installed, so nothing to compare on disk — ${Object.keys(skills).length} lockfile entry/entries are well-formed.`,
    );
    process.exit(0);
  }
  console.log("❌ skills-lock.json is not usable.\n");
  report(
    "Cannot be reinstalled from:",
    problems,
    "fix the entry, or run --write on a machine with the skills installed",
  );
  process.exit(process.argv.includes("--check") ? 1 : 0);
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
