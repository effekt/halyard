#!/usr/bin/env node

// Packs every publishable package and asserts the manifest inside the tarball is installable.
//
// Workspace dependencies are written `catalog:` and `workspace:*`, which are build-time
// protocols no registry understands. pnpm rewrites them to real versions when it packs;
// npm does not. A package published through the wrong tool therefore looks fine in the
// repository and fails on `install` for every consumer, with an error that names the
// protocol rather than the mistake.
//
// This checks the artifact rather than the tool, so it holds whichever command produced it.
//
// Usage: node scripts/check-tarball.mjs [--check]

import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PACKAGES = join(ROOT, "packages");
const UNRESOLVED = /"(catalog:[^"]*|workspace:[^"]*|link:[^"]*)"/g;

// A directory with no manifest is a placeholder for a package a later phase creates.
function publishablePackages() {
  return readdirSync(PACKAGES, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(PACKAGES, entry.name))
    .filter((dir) => existsSync(join(dir, "package.json")));
}

// Re-invoke the package manager that started this script rather than a bare `pnpm`, whose
// shim resolves against a different PATH than the caller.
const PACK = process.env.npm_execpath
  ? [process.execPath, [process.env.npm_execpath]]
  : ["pnpm", []];

/** The package.json as it would arrive on a consumer's disk. */
function packedManifest(packageDir, destination) {
  const [command, argv] = PACK;
  // `-C` rather than `cwd`: a package manager running this script exports environment
  // pointing at the workspace root, which wins over the child's working directory. pnpm then
  // packs the root, whose manifest has no `version`, and reports that instead of the cause.
  try {
    execFileSync(command, [...argv, "-C", packageDir, "pack", "--pack-destination", destination], {
      stdio: "pipe",
    });
  } catch (error) {
    const detail = `${error.stdout ?? ""}${error.stderr ?? ""}`.trim();
    throw new Error(`pack failed for ${packageDir}\n${detail || "(the tool printed nothing)"}`);
  }
  const tarball = readdirSync(destination).find((name) => name.endsWith(".tgz"));
  if (!tarball) throw new Error(`pnpm pack produced no tarball in ${packageDir}`);
  return execFileSync("tar", ["-xzOf", join(destination, tarball), "package/package.json"], {
    encoding: "utf8",
  });
}

const offenders = [];
let checked = 0;

for (const packageDir of publishablePackages()) {
  const destination = mkdtempSync(join(tmpdir(), "nubbin-pack-"));
  try {
    const manifest = packedManifest(packageDir, destination);
    const unresolved = [...manifest.matchAll(UNRESOLVED)].map((match) => match[1]);
    if (unresolved.length > 0) offenders.push({ packageDir, unresolved });
    checked += 1;
  } finally {
    rmSync(destination, { recursive: true, force: true });
  }
}

if (offenders.length === 0) {
  console.log(`✅ ${checked} package(s) pack with every dependency resolved to a real version.`);
  process.exit(0);
}

console.log(
  "❌ A packed manifest still carries a workspace-only protocol. Published as-is, every\n" +
    "   `install` fails. Pack and publish with pnpm, which rewrites these; npm does not.\n",
);
for (const { packageDir, unresolved } of offenders) {
  console.log(`  ${packageDir}`);
  for (const specifier of unresolved) console.log(`        ${specifier}`);
  console.log("");
}

process.exit(process.argv.includes("--check") ? 1 : 0);
