#!/usr/bin/env node

// Fails when `plugins-lock.json` and the installed Claude Code plugins disagree by name.
//
// Plugins change what an agent produces far more than skills do — an agent with the
// accessibility engine attached finds contrast failures, and the same agent without it ships
// them. That makes the installed set a property of how this repository gets written, and an
// unrecorded property is one nobody else can reproduce.
//
// Names only, deliberately. The plugin manifest records a `version` of `"unknown"` for any
// plugin installed from a marketplace that does not publish one, and a gate that compared
// those would fail for a reason the contributor cannot act on. What is checkable is the set:
// a plugin in the lockfile nobody installed sends a reader after tooling the work never used,
// and an installed plugin missing from the lockfile is a result nobody else can reproduce.
// Version and commit are recorded as evidence, not as assertions.
//
// Skips silently where the manifest is absent, so a fresh clone and CI both pass — the same
// reason `check-skills-lock.mjs` skips. Failing there would make the gate mean "you have not
// set up your machine" rather than "the record is wrong".
//
// Usage: node scripts/check-plugins-lock.mjs [--check] [--write]

import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const LOCKFILE = join(ROOT, "plugins-lock.json");
const PLUGIN_DIR = join(homedir(), ".claude", "plugins");
const MANIFEST = join(PLUGIN_DIR, "installed_plugins.json");
const MARKETPLACES = join(PLUGIN_DIR, "known_marketplaces.json");

/**
 * Reads the installed set as `{ "name@marketplace": {version, commit} }`.
 *
 * `installPath` is dropped on purpose: it is an absolute path on a contributor's machine, and
 * this repository is public.
 */
async function installed() {
  const manifest = JSON.parse(await readFile(MANIFEST, "utf8"));
  const out = {};
  for (const [key, records] of Object.entries(manifest.plugins ?? {})) {
    const record = Array.isArray(records) ? records[0] : records;
    if (!record) continue;
    out[key] = { version: record.version ?? "unknown", commit: record.gitCommitSha ?? null };
  }
  return out;
}

/** Only the marketplaces something is actually installed from. */
async function marketplacesFor(names) {
  const known = JSON.parse(await readFile(MARKETPLACES, "utf8"));
  const used = new Set(names.map((name) => name.split("@").at(-1)));
  return Object.fromEntries(
    Object.entries(known)
      .filter(([name]) => used.has(name))
      // `source` nests a second `source` naming the kind, alongside the repo itself.
      .map(([name, entry]) => [name, entry.source?.repo ?? null])
      .sort(),
  );
}

function sorted(record) {
  return Object.fromEntries(Object.entries(record).sort());
}

function report(heading, rows, remedy) {
  if (rows.length === 0) return;
  console.log(`  ${heading}`);
  for (const row of rows.sort()) console.log(`        ${row}`);
  console.log(`        → ${remedy}\n`);
}

const write = process.argv.includes("--write");

if (!existsSync(MANIFEST)) {
  console.log("✅ No plugin manifest on this machine — nothing to compare.");
  process.exit(0);
}

const live = await installed();
const names = Object.keys(live);

if (write) {
  const lock = {
    version: 1,
    marketplaces: await marketplacesFor(names),
    plugins: sorted(live),
  };
  await writeFile(LOCKFILE, `${JSON.stringify(lock, null, 2)}\n`);
  console.log(`✅ Wrote plugins-lock.json — ${names.length} plugin(s).`);
  process.exit(0);
}

const lock = JSON.parse(await readFile(LOCKFILE, "utf8"));
const recorded = Object.keys(lock.plugins ?? {});

const missing = recorded.filter((name) => !(name in live));
const unrecorded = names.filter((name) => !(name in (lock.plugins ?? {})));

if (missing.length === 0 && unrecorded.length === 0) {
  console.log(`✅ plugins-lock.json matches the installed set — ${recorded.length} plugin(s).`);
  process.exit(0);
}

console.log("\n❌ plugins-lock.json and the installed plugins disagree.\n");
report("Recorded but not installed:", missing, "install it, or drop it from the lockfile");
report("Installed but not recorded:", unrecorded, "run `pnpm plugins-lock --write`");
process.exit(1);
