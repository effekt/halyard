#!/usr/bin/env node
// Rejects range specifiers in dependencies and devDependencies. Every version is exact.
//
// A caret is an instruction to install code nobody has reviewed, on a schedule set by
// whoever holds the publishing token. `minimumReleaseAge` in pnpm-workspace.yaml delays
// that by 3 days; pinning removes the automatic upgrade entirely, so a new version arrives
// only in a commit someone wrote. The two together are the control — either alone leaks.
//
// `workspace:*` and `catalog:` are exact by construction. peerDependencies are exempt: a
// library must accept a RANGE of its host's versions, and pinning one there would force
// every consumer onto a single React.
//
// Usage: node scripts/check-pinned-deps.mjs [files...] [--check]

import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SCAN_ROOTS = ["packages", "apps", "examples"];
const CHECKED_FIELDS = ["dependencies", "devDependencies", "optionalDependencies"];
const EXACT_VERSION = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
const ALLOWED_PROTOCOL = /^(workspace:|catalog:|link:|file:)/;

async function findManifests(dir, found) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const entry of entries) {
    if (entry.name === "node_modules") continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await findManifests(full, found);
    else if (entry.name === "package.json") found.push(full);
  }
  return found;
}

async function collectTargets(explicit) {
  if (explicit.length > 0) return explicit.map((file) => resolve(ROOT, file)).filter(existsSync);
  const found = [join(ROOT, "package.json")];
  for (const root of SCAN_ROOTS) await findManifests(join(ROOT, root), found);
  return found;
}

/** Every unpinned entry in one manifest, as `field.name → "specifier"` rows. */
async function unpinnedEntries(file) {
  const manifest = JSON.parse(await readFile(file, "utf8"));
  return CHECKED_FIELDS.flatMap((field) =>
    Object.entries(manifest[field] ?? {})
      .filter(([, spec]) => !ALLOWED_PROTOCOL.test(spec) && !EXACT_VERSION.test(spec))
      .map(([name, spec]) => `${field}.${name} → "${spec}"`),
  );
}

const args = process.argv.slice(2);
const check = args.includes("--check");
const targets = await collectTargets(args.filter((arg) => !arg.startsWith("--")));

const offenders = [];
for (const file of targets) {
  const entries = await unpinnedEntries(file);
  if (entries.length > 0) offenders.push({ file: relative(ROOT, file), entries });
}

if (offenders.length === 0) {
  console.log(`✅ All dependencies pinned across ${targets.length} manifest(s).`);
  process.exit(0);
}

console.log(
  `❌ ${offenders.length} manifest(s) use a version range. Pin the exact version, or move it\n` +
    `   to the catalog and reference it as "catalog:". Ranges auto-install unreviewed code.\n`,
);
for (const { file, entries } of offenders) {
  console.log(`  ${file}`);
  for (const entry of entries) console.log(`        ${entry}`);
  console.log("");
}

process.exit(check ? 1 : 0);
