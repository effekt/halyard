#!/usr/bin/env node

// Keeps AGENTS.md's gate table and `pnpm verify` in agreement, in both directions.
//
// That table is what a contributor reads to learn what is enforced, so it makes two claims:
// every row runs, and every gate has a row. Both have been wrong.
//
//   - `publint` and `attw` were installed, documented as gates, and wired to nothing.
//   - `attw` packed `packages/core` while the row implied the set `publint` covers.
//   - `check-release-tag.mjs` sits in the table and runs only on the release path, which is
//     correct, while the prose below promised `verify` runs every gate above.
//   - four gates ran in `verify` with no row at all, so a contributor reading the table to
//     learn what is enforced was told about none of them.
//
// The first is already in `.claude/rules/gates.md`. Checking one direction is what let the
// fourth through: a row must resolve to something `verify` reaches, *and* a script `verify`
// reaches must have a row — each with a named exception carrying a reason otherwise.
//
// Reachability is computed by walking `verify`'s command through the scripts it calls, so a
// gate wired in at any depth counts and a gate wired in nowhere does not. It cannot tell you a
// reachable gate checks the right thing — `attw` was reachable throughout.
//
// Usage: node scripts/check-gate-table.mjs [--check]

import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
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
  ["check-worktree.mjs", "PreToolUse hook; there is no tool call to refuse during a verify run"],
  [
    "check-primary-tree.mjs",
    "dispatch hook and pre-push; a CI checkout is clean, so a verify run would pass vacuously",
  ],
]);

/**
 * Scripts `verify` runs that deliberately have no row. Empty, and that is the point: every
 * script `verify` reaches is something a contributor should be able to read about in the table,
 * so an addition here is a decision to hide one, and needs a reason beside it.
 */
const UNLISTED = new Map();

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

const SCRIPT_FILE = /scripts\/([A-Za-z0-9._-]+\.mjs)/g;
const PNPM_CALL = /pnpm (?:run )?([A-Za-z0-9:_-]+)/g;
/** A binary invoked directly, as `pnpm exec biome` or at the head of a chained command. */
const DIRECT_BINARY = /(?:^|&&|\|\|)\s*(?:pnpm exec )?([a-z-]+)/g;

/** The capture group of every match, which is all any of the three patterns above needs. */
function captures(text, pattern) {
  return [...text.matchAll(pattern)].map((match) => match[1]);
}

/** Every name a command invokes, whether or not a script of that name exists. */
function invokedNames(cmd) {
  return [...captures(cmd, PNPM_CALL), ...captures(cmd, DIRECT_BINARY)];
}

/**
 * Records one command's script files and the names it invokes, and returns the script bodies
 * it newly reaches. Split out because the nesting, not the logic, is what carries the
 * complexity — the whole walk in one function scores past the cap.
 */
function stepOnce(cmd, scripts, files, names) {
  for (const file of captures(cmd, SCRIPT_FILE)) files.add(file);
  const reached = [];
  for (const name of invokedNames(cmd)) {
    if (names.has(name)) continue;
    names.add(name);
    if (scripts[name]) reached.push(scripts[name]);
  }
  return reached;
}

/**
 * Every `scripts/*.mjs` and every script name `verify` reaches, at any depth.
 *
 * A queue rather than recursion, and no depth guard: `names` already admits each script once,
 * which is what bounds the walk.
 */
function reachableFromVerify(scripts) {
  const files = new Set();
  const names = new Set();
  const pending = [scripts.verify];
  while (pending.length > 0) {
    const cmd = pending.pop();
    if (cmd) pending.push(...stepOnce(cmd, scripts, files, names));
  }
  return { files, names };
}

/** The first cell of a markdown table row, or null where the line is not one. */
function gateCell(line) {
  if (!line.startsWith("|") || line.includes("---")) return null;
  return line.split("|")[1] ?? "";
}

/** The gate column of every table row in AGENTS.md, as script filenames and tool names. */
function namedGates(agents) {
  const gates = new Set();
  for (const line of agents.split("\n")) {
    const cell = gateCell(line);
    if (cell === null) continue;
    for (const token of captures(cell, /`([^`]+)`/g)) {
      const name = token.trim();
      if (name.endsWith(".mjs") || TOOL_ROWS.has(name)) gates.add(name);
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

// The other direction: a gate `verify` runs with no row is enforced against contributors who
// were never told it exists. Four were, which is why this half exists.
const unlisted = [...files].filter((file) => !gates.has(file) && !UNLISTED.has(file));

// A rule that names a gate reads as enforced. `writing-rules.md` already requires each rule to
// declare its gate status for that reason, and naming one that does not exist is worse than
// saying nothing: the declaration is what stops a reader checking. `planning.md` cited
// `check-plan-files.mjs` while no such script existed, and neither direction above could see it,
// because both read `verify` and the table rather than the rules.
const RULES_DIR = join(ROOT, ".claude/rules");
const ruleFiles = (await readdir(RULES_DIR)).filter((name) => name.endsWith(".md"));
const phantomCitations = [];
for (const name of ruleFiles) {
  const text = await readFile(join(RULES_DIR, name), "utf8");
  for (const match of text.matchAll(/`(check-[a-z0-9-]+\.mjs)`/g)) {
    const named = match[1];
    if (existsSync(join(ROOT, "scripts", named))) continue;
    phantomCitations.push(`.claude/rules/${name}  names ${named}, which does not exist`);
  }
  // A named skill is the same claim in a different noun. `.gitignore` carries
  // `/.claude/skills/*` with one negation per repository-local skill, so a skill added without
  // its `!` line is staged by nothing and reported by nothing — which is how a rule came to cite
  // a `worktree` skill that had never been committed.
  for (const match of text.matchAll(/`([a-z][a-z0-9-]+)` skill/g)) {
    const named = match[1];
    if (existsSync(join(ROOT, ".claude/skills", named, "SKILL.md"))) continue;
    phantomCitations.push(
      `.claude/rules/${name}  names the \`${named}\` skill, which does not exist`,
    );
  }
}

// An exception for something `verify` now reaches is stale bookkeeping, and the next reader
// trusts it. Report it rather than letting the list rot.
const staleExceptions = [...EXCEPTIONS.keys()].filter((gate) => files.has(gate));

if (
  unreached.length === 0 &&
  unlisted.length === 0 &&
  staleExceptions.length === 0 &&
  phantomCitations.length === 0
) {
  console.log(
    `✅ Gate table honest — ${gates.size} gate(s) named, ${gates.size - EXCEPTIONS.size} reached by verify, ${EXCEPTIONS.size} documented exception(s); all ${files.size} script(s) verify runs have a row; ${ruleFiles.length} rule file(s) name only gates and skills that exist.`,
  );
  process.exit(0);
}

console.log("\n❌ AGENTS.md's gate table and `pnpm verify` disagree.\n");
if (unreached.length > 0) {
  console.log("  Named in the table, not run by verify:");
  for (const gate of unreached.sort()) console.log(`        ${gate}`);
  console.log("        → wire it into `verify`, or add it to EXCEPTIONS here with a reason\n");
}
if (unlisted.length > 0) {
  console.log("  Run by verify, absent from the table:");
  for (const gate of unlisted.sort()) console.log(`        ${gate}`);
  console.log("        → give it a row, or add it to UNLISTED here with a reason\n");
}
for (const gate of staleExceptions.sort()) {
  console.log(`  ${gate}  is listed as an exception but verify now reaches it`);
  console.log("        → drop it from EXCEPTIONS\n");
}
if (phantomCitations.length > 0) {
  console.log("  Named by a rule, but not present:");
  for (const citation of phantomCitations.sort()) console.log(`        ${citation}`);
  console.log(
    "        \u2192 create it, or drop the citation. A skill also needs its `!` line in .gitignore\n",
  );
}
process.exit(process.argv.includes("--check") ? 1 : 0);
