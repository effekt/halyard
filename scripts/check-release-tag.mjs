#!/usr/bin/env node

// Refuses a stable release while any package version is a prerelease.
//
// `pnpm release` ends in `changeset publish`, which publishes to the `latest` dist-tag unless
// told otherwise. A version like 0.1.0-rc.0 taking `latest` means `npm install @nubbin/core`
// hands a release candidate to everyone who did not ask for one, and the fix is a second
// publish rather than an undo — npm keeps what was published.
//
// `publishConfig.tag` does not close this: pnpm's publish path ignores it, verified by a
// dry-run that announced `latest` with the field set. The dist-tag is decided by the command,
// so the command is what this checks — `pnpm release:rc` passes `--tag rc` and skips this.
//
// Usage: node scripts/check-release-tag.mjs [--check]

import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PACKAGES = join(ROOT, "packages");
const PRERELEASE = /^\d+\.\d+\.\d+-/;

async function publishableManifests() {
  const entries = await readdir(PACKAGES, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(PACKAGES, entry.name, "package.json"))
    .filter(existsSync);
}

const prereleases = [];
for (const file of await publishableManifests()) {
  const manifest = JSON.parse(await readFile(file, "utf8"));
  if (manifest.private === true) continue;
  if (PRERELEASE.test(manifest.version ?? "")) {
    prereleases.push(`${manifest.name}@${manifest.version}  (${relative(ROOT, file)})`);
  }
}

if (prereleases.length === 0) {
  console.log("✅ No prerelease versions — a stable publish is safe.");
  process.exit(0);
}

console.log(
  "❌ A prerelease version would be published to the `latest` dist-tag.\n\n" +
    "   Use `pnpm release:rc`, which passes --tag rc. Publishing a release candidate to\n" +
    "   `latest` gives it to everyone running a plain install, and npm keeps what it is\n" +
    "   given — the only correction is another publish.\n",
);
for (const row of prereleases) console.log(`        ${row}`);
console.log("");

process.exit(process.argv.includes("--check") ? 1 : 0);
