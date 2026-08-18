#!/usr/bin/env node

// Rejects junk-drawer filenames: a file named for a category rather than for the unit it
// holds accumulates whatever nobody wanted to name.
//
// Biome owns the line caps (`noExcessiveLinesPerFile` 200, `noExcessiveLinesPerFunction`
// 50) and `useFilenamingConvention: filenameCases:["export"]` forces filename === export.
// That last rule technically permits `export const utils = {…}` in `utils.ts`, which is
// exactly the shape worth blocking, so this closes it.
//
// It is also what keeps filename → symbol invertible: `utils.ts` names no unit, so a file with
// that name has no row `scripts/catalog.mjs` could derive. The other two rules make the mapping;
// this one stops a name that maps to nothing.
//
// Pass explicit paths to check those; pass none to scan every source file git would
// publish. `--check` exits 1.

import { existsSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { trackedFiles } from "./trackedFiles.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_EXT = /\.(ts|tsx)$/;
const JUNK_BASENAME =
  /^(utils?|helpers?|misc|common|stuff|shared|things|lib|core|base|extras?|temp|tmp)\.(ts|tsx)$/i;

function collectTargets(explicit) {
  if (explicit.length > 0) return explicit.map((file) => resolve(ROOT, file)).filter(existsSync);
  return trackedFiles(ROOT)
    .filter((path) => SOURCE_EXT.test(path))
    .map((path) => join(ROOT, path));
}

const args = process.argv.slice(2);
const check = args.includes("--check");
const targets = collectTargets(args.filter((arg) => !arg.startsWith("--")));

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
