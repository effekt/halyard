#!/usr/bin/env node

// Fails when a gate named in AGENTS.md's table is not actually reachable from `pnpm verify`.
//
// That table is what a contributor reads to learn what is enforced, so a row in it is a claim
// about the build. The claim has been wrong three times:
//
//   - `publint` and `attw` were installed, documented as gates, and wired to nothing.
//   - `attw` packed `packages/core` while the row implied the set `publint` covers.
//   - `check-release-tag.mjs` sits in the table and runs only on the release path, which is
//     correct, while the prose below promised `verify` runs every gate above.
//
// The first is already in `.claude/rules/gates.md`. This stops the shape recurring: a row
// resolves to something `verify` reaches, or to a named exception with a reason beside it.
//
// Reachability is computed by walking `verify`'s command through the scripts it calls, so a
// gate wired in at any depth counts and a gate wired in nowhere does not. It cannot tell you a
// reachable gate checks the right thing — `attw` was reachable throughout.
//
// Usage: node scripts/check-gate-table.mjs [--check]

import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Gates the table names that `verify` deliberately does not reach. Each needs a reason, because
 * an exception without one is indistinguishable from an oversight — which is how this started.
 */
const EXCEPTIONS = new Map([
  ["check-stale-docs.mjs", "advisory; pre-push and continue-on-error in CI, so it cannot block"],
  [
    "check-release-tag.mjs",
    "release path only; every local version is a prerelease, so it would fail every run",
  ],
]);

/** Tool-shaped rows are named by binary rather than by file. */
const TOOL_ROWS = new Map([
  ["biome", "lint"],
  ["knip", "knip"],
  ["jscpd", "dupes"],
  ["dependency-cruiser", "boundaries"],
  ["type-coverage", "type-coverage"],
  ["publint", "publint"],
  ["attw", "attw"],
]);

/** Every `scripts/*.mjs` and every script name `verify` reaches, at any depth. */
function reachableFromVerify(scripts) {
  const files = new Set();
  const names = new Set();
  const walk = (cmd, depth = 0) => {
    if (depth > 8 || !cmd) return;
    for (const match of cmd.matchAll(/scripts\/([A-Za-z0-9._-]+\.mjs)/g)) files.add(match[1]);
    for (const match of cmd.matchAll(/pnpm (?:run )?([A-Za-z0-9:_-]+)/g)) {
      const name = match[1];
      if (names.has(name)) continue;
      names.add(name);
      if (scripts[name]) walk(scripts[name], depth + 1);
    }
    for (const match of cmd.matchAll(/(?:^|&&|\|\|)\s*(?:pnpm exec )?([a-z-]+)/g))
      names.add(match[1]);
  };
  walk(scripts.verify);
  return { files, names };
}

/** The gate column of every table row in AGENTS.md, as script filenames and tool names. */
function namedGates(agents) {
  const gates = new Set();
  for (const line of agents.split("\n")) {
    if (!line.startsWith("|") || line.includes("---")) continue;
    const cell = line.split("|")[1] ?? "";
    for (const match of cell.matchAll(/`([^`]+)`/g)) {
      const token = match[1].trim();
      if (token.endsWith(".mjs") || TOOL_ROWS.has(token)) gates.add(token);
    }
  }
  return gates;
}

const scripts = JSON.parse(await readFile(join(ROOT, "package.json"), "utf8")).scripts ?? {};
const agents = await readFile(join(ROOT, "AGENTS.md"), "utf8");
const { files, names } = reachableFromVerify(scripts);
const gates = namedGates(agents);

const unreached = [];
for (const gate of gates) {
  const reached = gate.endsWith(".mjs") ? files.has(gate) : names.has(TOOL_ROWS.get(gate) ?? gate);
  if (reached) continue;
  if (EXCEPTIONS.has(gate)) continue;
  unreached.push(gate);
}

// An exception for something `verify` now reaches is stale bookkeeping, and the next reader
// trusts it. Report it rather than letting the list rot.
const staleExceptions = [...EXCEPTIONS.keys()].filter((gate) => files.has(gate));

if (unreached.length === 0 && staleExceptions.length === 0) {
  console.log(
    `✅ Gate table honest — ${gates.size} gate(s) named, ${gates.size - EXCEPTIONS.size} reached by verify, ${EXCEPTIONS.size} documented exception(s).`,
  );
  process.exit(0);
}

console.log("\n❌ AGENTS.md names gates that `pnpm verify` does not run.\n");
if (unreached.length > 0) {
  for (const gate of unreached.sort()) console.log(`  ${gate}`);
  console.log("        → wire it into `verify`, or add it to EXCEPTIONS here with a reason\n");
}
for (const gate of staleExceptions.sort()) {
  console.log(`  ${gate}  is listed as an exception but verify now reaches it`);
  console.log("        → drop it from EXCEPTIONS\n");
}
process.exit(process.argv.includes("--check") ? 1 : 0);
