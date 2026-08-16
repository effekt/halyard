#!/usr/bin/env node
// Rejects junk-drawer filenames: a file named for a category rather than for the unit it
// holds accumulates whatever nobody wanted to name.
//
// Biome owns the line caps (`noExcessiveLinesPerFile` 200, `noExcessiveLinesPerFunction`
// 50) and `useFilenamingConvention: filenameCases:["export"]` forces filename === export.
// That last rule technically permits `export const utils = {…}` in `utils.ts`, which is
// exactly the shape worth blocking, so this closes it.
//
// Pass explicit paths to check those; pass none to scan SCAN_ROOTS. `--check` exits 1.

import { readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SCAN_ROOTS = ["packages", "apps"];
const SOURCE_EXT = /\.(ts|tsx)$/;
const EXCLUDED_DIRS = new Set(["node_modules", "dist", ".next", ".turbo", "generated"]);
const JUNK_BASENAME =
  /^(utils?|helpers?|misc|common|stuff|shared|things|lib|core|base|extras?|temp|tmp)\.(ts|tsx)$/i;

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
    else if (SOURCE_EXT.test(entry.name)) found.push(full);
  }
  return found;
}

async function collectTargets(explicit) {
  if (explicit.length > 0) return explicit.map((file) => resolve(ROOT, file)).filter(existsSync);
  const found = [];
  for (const root of SCAN_ROOTS) await walk(join(ROOT, root), found);
  return found;
}

const args = process.argv.slice(2);
const check = args.includes("--check");
const targets = await collectTargets(args.filter((arg) => !arg.startsWith("--")));

const offenders = targets
  .map((file) => relative(ROOT, file))
  .filter((rel) => JUNK_BASENAME.test(rel.split(sep).at(-1) ?? ""));

if (offenders.length === 0) {
  console.log(`✅ No junk-drawer filenames in ${targets.length} checked file(s).`);
  process.exit(0);
}

console.log(
  `❌ ${offenders.length} junk-drawer filename(s). Name the file after the unit it holds —\n` +
    `   a category name collects whatever nobody wanted to name.\n`,
);
for (const offender of offenders) console.log(`  ${offender}`);
console.log("");
process.exit(check ? 1 : 0);
