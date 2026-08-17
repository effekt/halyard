#!/usr/bin/env node

// Fails when a publishable package is missing what a registry page needs.
//
// Four packages shipped with no README, so npmjs.com rendered "ERROR: No README data found!"
// as the public page of each. Three also declared no `license`, which npm reads as unlicensed
// on a project whose LICENSE sits at the repository root, and no `repository`, which is what
// provenance attests against.
//
// publint passes all of it. It checks that a package RESOLVES — the exports map, the types
// condition, the file paths — not that it is presentable or correctly licensed. Those are
// different questions and only one of them had a gate.
//
// A README is required on disk rather than in the tarball: npm always includes README.md and
// LICENSE from a package directory regardless of `files`, so its presence beside the manifest
// is what decides whether the registry page has anything on it.
//
// Usage: node scripts/check-package-metadata.mjs [--check]

import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PACKAGES = join(ROOT, "packages");
const REQUIRED = ["description", "license", "repository"];

/** Everything missing from one package, as reasons a reader can act on. */
async function shortfall(packageDir) {
  const manifest = JSON.parse(await readFile(join(packageDir, "package.json"), "utf8"));
  const missing = REQUIRED.filter((field) => {
    const value = manifest[field];
    return value === undefined || value === "" || Object.keys(value).length === 0;
  }).map((field) => `${field} — the registry page shows nothing for it`);

  if (!existsSync(join(packageDir, "README.md"))) {
    missing.push('README.md — npm renders "ERROR: No README data found!" without one');
  }
  if (!existsSync(join(packageDir, "LICENSE"))) {
    missing.push("LICENSE — pnpm may carry the root copy, which is not a guarantee to rely on");
  }
  return { name: manifest.name ?? relative(ROOT, packageDir), missing };
}

const dirs = (await readdir(PACKAGES, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => join(PACKAGES, entry.name))
  .filter((dir) => existsSync(join(dir, "package.json")));

const offenders = [];
for (const dir of dirs) {
  const { name, missing } = await shortfall(dir);
  if (missing.length > 0) offenders.push({ name, dir: relative(ROOT, dir), missing });
}

if (offenders.length === 0) {
  console.log(`✅ ${dirs.length} package(s) carry a README, a licence and repository metadata.`);
  process.exit(0);
}

console.log("❌ A publishable package is missing metadata a registry page needs.\n");
for (const { name, dir, missing } of offenders) {
  console.log(`  ${name}  (${dir})`);
  for (const reason of missing) console.log(`        ${reason}`);
  console.log("");
}

process.exit(process.argv.includes("--check") ? 1 : 0);
