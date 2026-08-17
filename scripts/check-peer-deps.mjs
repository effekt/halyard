#!/usr/bin/env node

// Fails when a package declares a peer dependency nothing in it imports.
//
// npm installs peers by default, so a declared peer is a package the consumer receives whether
// they need it or not. `@nubbin/react` shipped a React peer while importing nothing from React,
// and `npm install @nubbin/react` pulled React in for two pure functions.
//
// This is the same defect knip rejects for `dependencies` — a declaration nothing uses — but
// knip does not read `peerDependencies`, and `check-installable.mjs` cannot see it either,
// because the package imports perfectly well. It just brings something along.
//
// A peer is matched by any import of it or a subpath, in any source file including tests: a
// peer used only by a test is still genuinely used. `import type` counts, because a type-only
// peer is a real requirement on the consumer's install.
//
// Usage: node scripts/check-peer-deps.mjs [--check]

import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PACKAGES = join(ROOT, "packages");
const SOURCE = /\.tsx?$/;

async function sourceFiles(dir, found = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === "dist") continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await sourceFiles(full, found);
    else if (SOURCE.test(entry.name)) found.push(full);
  }
  return found;
}

/** True when any source file imports the peer, or a subpath of it. */
async function isImported(packageDir, peer) {
  const escaped = peer.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`["']${escaped}(/[^"']*)?["']`);
  for (const file of await sourceFiles(join(packageDir, "src"))) {
    if (pattern.test(await readFile(file, "utf8"))) return true;
  }
  return false;
}

async function unusedPeers(packageDir) {
  const manifest = JSON.parse(await readFile(join(packageDir, "package.json"), "utf8"));
  const peers = Object.keys(manifest.peerDependencies ?? {});
  const unused = [];
  for (const peer of peers) {
    if (!(await isImported(packageDir, peer))) unused.push(peer);
  }
  return { name: manifest.name, unused, checked: peers.length };
}

const dirs = (await readdir(PACKAGES, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => join(PACKAGES, entry.name))
  .filter((dir) => existsSync(join(dir, "package.json")));

const offenders = [];
let peerCount = 0;

for (const dir of dirs) {
  const { name, unused, checked } = await unusedPeers(dir);
  peerCount += checked;
  if (unused.length > 0) offenders.push({ name, dir: relative(ROOT, dir), unused });
}

if (offenders.length === 0) {
  console.log(
    `✅ Every peer dependency is imported — ${peerCount} across ${dirs.length} package(s).`,
  );
  process.exit(0);
}

console.log(
  "❌ A package declares a peer dependency nothing imports. npm installs peers by default,\n" +
    "   so a consumer receives it for nothing. Drop it, or add it back with the code that\n" +
    "   needs it.\n",
);
for (const { name, dir, unused } of offenders) {
  console.log(`  ${name}  (${dir})`);
  for (const peer of unused) console.log(`        ${peer}`);
  console.log("");
}

process.exit(process.argv.includes("--check") ? 1 : 0);
