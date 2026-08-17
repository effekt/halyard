#!/usr/bin/env node

// Installs every package from its own tarball into an empty project and imports it.
//
// `check-tarball.mjs` reads the packed *manifest*. Nothing loaded the packed *code*, and three
// defects shipped through that gap: a peer dependency the package never imported, a workspace
// protocol that had to survive rewriting, and a bare subpath specifier that resolves only
// through a bundler — which broke every export in the package, not just the one that used it.
//
// Each was invisible in the source tree, in the tests and in every other gate. The only place
// they existed was the artifact a consumer installs, so that is what this loads.
//
// The install is real, peers included, because the failures were resolution failures and a
// shim would have resolved what npm does not.
//
// Usage: node scripts/check-installable.mjs [--check]

import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PACKAGES = join(ROOT, "packages");

// Re-invoke the package manager that started this script; a bare `pnpm` resolves against a
// different PATH than the caller. `-C` rather than cwd, for the reason check-tarball records.
const PNPM = process.env.npm_execpath
  ? [process.execPath, [process.env.npm_execpath]]
  : ["pnpm", []];

function publishableDirs() {
  return readdirSync(PACKAGES, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(PACKAGES, entry.name))
    .filter((dir) => existsSync(join(dir, "package.json")));
}

function packInto(packageDir, destination) {
  const [command, argv] = PNPM;
  execFileSync(command, [...argv, "-C", packageDir, "pack", "--pack-destination", destination], {
    stdio: "pipe",
  });
}

/** Imports each package by name from the throwaway project and returns what failed. */
function importFailures(project, names) {
  const probe = join(project, "probe.mjs");
  const body = names
    .map(
      (name) => `{ const m = await import(${JSON.stringify(name)});
  const n = Object.keys(m).length;
  if (n === 0) throw new Error(${JSON.stringify(name)} + " imported with no exports");
  console.log("  ok " + ${JSON.stringify(name)} + " — " + n + " export(s)"); }`,
    )
    .join("\n");
  writeFileSync(probe, body);
  try {
    return { output: execFileSync(process.execPath, [probe], { cwd: project, encoding: "utf8" }) };
  } catch (error) {
    return { failure: `${error.stdout ?? ""}${error.stderr ?? ""}`.trim() };
  }
}

const dirs = publishableDirs();
if (dirs.length === 0) {
  console.log("✅ No publishable packages yet.");
  process.exit(0);
}

const tarballs = mkdtempSync(join(tmpdir(), "nubbin-tgz-"));
const project = mkdtempSync(join(tmpdir(), "nubbin-consumer-"));
let result;

try {
  const names = [];
  for (const dir of dirs) {
    packInto(dir, tarballs);
    names.push(JSON.parse(await readFile(join(dir, "package.json"), "utf8")).name);
  }
  writeFileSync(join(project, "package.json"), '{"name":"consumer","private":true}\n');
  const archives = readdirSync(tarballs).map((file) => join(tarballs, file));
  execFileSync("npm", ["install", "--no-audit", "--no-fund", ...archives], {
    cwd: project,
    stdio: "pipe",
  });
  result = importFailures(project, names);
} finally {
  rmSync(tarballs, { recursive: true, force: true });
  rmSync(project, { recursive: true, force: true });
}

if (result.failure === undefined) {
  process.stdout.write(result.output);
  console.log(`✅ ${dirs.length} package(s) install from a tarball and import cleanly.`);
  process.exit(0);
}

console.log(
  "❌ A package does not load when installed. The source tree and every other gate can be\n" +
    "   clean while this fails — resolution is decided by the published layout.\n",
);
console.log(result.failure);
console.log("");

process.exit(process.argv.includes("--check") ? 1 : 0);
