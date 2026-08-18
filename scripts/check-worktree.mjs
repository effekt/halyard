#!/usr/bin/env node

// Refuses an edit to the primary worktree, and a linked worktree whose gates cannot run.
//
// Two failures, one root. An agent editing the shared tree mutates files another session is
// reading: two builders in one session reported reasoning around an uncommitted
// `.claude/rules/planning.md` they could not distinguish from committed state, and one changed
// what it wrote because of it. A linked worktree created without an install fails differently
// and worse — git hooks live in the common directory so they fire, but `pnpm exec lefthook`
// has no runner, so the commit aborts with `Command "lefthook" not found`. That names nothing
// an agent can act on, and the reflex it invites is `--no-verify`, which is the one response
// that turns a fail-closed crash into a silent bypass.
//
// Its authority stops at this repository. A scratchpad outside any checkout and a file in an
// unrelated repository are both none of its business, and it said so by crashing before.
//
// Usage: node scripts/check-worktree.mjs [path...] [--check]
//        node scripts/check-worktree.mjs --hook     (PreToolUse, reads JSON on stdin)

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Set when the primary tree is genuinely the right place — creating the first worktree. */
const ESCAPE = "NUBBIN_MAIN_TREE_OK";
/** PreToolUse blocks by exiting 2; stderr is what reaches the agent. */
const BLOCK = 2;

/** `null` where `cwd` is not inside a repository, which every caller treats as "not mine". */
function gitIn(cwd, args) {
  try {
    return execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

/** Absolute common directory for `cwd`, shared by a repository's primary tree and its worktrees. */
function commonDirOf(cwd) {
  const common = gitIn(cwd, ["rev-parse", "--git-common-dir"]);
  return common === null ? null : resolve(cwd, common);
}

const OWN_COMMON_DIR = commonDirOf(dirname(fileURLToPath(import.meta.url)));

/**
 * A linked worktree has its own git dir under the common one; the primary tree has them equal.
 * Comparing resolved paths rather than parsing `git worktree list` keeps it correct when the
 * repository itself has moved, which has already happened here.
 */
function isPrimaryWorktree(cwd) {
  const dir = gitIn(cwd, ["rev-parse", "--git-dir"]);
  return dir !== null && resolve(cwd, dir) === commonDirOf(cwd);
}

/**
 * `pnpm exec lefthook` resolves from the worktree's own `node_modules`, so a worktree without
 * one cannot run the gate set even though the hooks fire.
 */
const gatesCanRun = (root) => existsSync(resolve(root, "node_modules", "lefthook"));

const primaryTreeRefusal = (root) =>
  [
    `Refusing to edit the primary worktree at ${root}.`,
    "",
    "Another session may be reading these files, and an uncommitted edit here is",
    "indistinguishable from committed state to every agent that reads it.",
    "",
    "  git worktree add -b <branch> .worktrees/<name> origin/main && \\",
    "    cd .worktrees/<name> && pnpm install",
    "",
    "The `worktree` skill does both, and checks the gates afterwards.",
    `Set ${ESCAPE}=1 only to bootstrap the first worktree.`,
  ].join("\n");

const uninstalledRefusal = (root) =>
  [
    `The worktree at ${root} has no installed lefthook, so its gates cannot run.`,
    "",
    "Git hooks live in the common directory and will fire, but `pnpm exec lefthook`",
    'has no runner — the commit aborts with `Command "lefthook" not found`.',
    "",
    `  cd ${root} && pnpm install`,
    "",
    "Never answer that crash with --no-verify: it converts a blocked commit into an",
    "unchecked one.",
  ].join("\n");

function verdict(cwd) {
  if (process.env[ESCAPE] === "1") return null;
  if (OWN_COMMON_DIR === null) return null;
  if (commonDirOf(cwd) !== OWN_COMMON_DIR) return null;
  const root = gitIn(cwd, ["rev-parse", "--show-toplevel"]);
  if (root === null) return null;
  if (isPrimaryWorktree(cwd)) return primaryTreeRefusal(root);
  return gatesCanRun(root) ? null : uninstalledRefusal(root);
}

/** PreToolUse hands the tool call on stdin; the edited path decides which worktree is in play. */
async function hookTarget() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const raw = chunks.join("");
  if (raw.trim().length === 0) return process.cwd();
  try {
    const input = JSON.parse(raw);
    const path = input?.tool_input?.file_path ?? input?.tool_input?.path;
    return path ? dirname(path) : process.cwd();
  } catch {
    return process.cwd();
  }
}

/** What the run examined, so a pass is distinguishable from a run that checked nothing. */
function summary(cwd) {
  const root = gitIn(cwd, ["rev-parse", "--show-toplevel"]);
  if (root === null) return `outside any repository (${cwd}) — nothing to enforce`;
  if (commonDirOf(cwd) !== OWN_COMMON_DIR)
    return `another repository (${root}) — nothing to enforce`;
  const where = isPrimaryWorktree(cwd) ? "primary worktree" : "linked worktree";
  return `${where} ${relative(resolve(root, ".."), root) || root}, lefthook installed`;
}

const args = process.argv.slice(2);
const hook = args.includes("--hook");
const check = args.includes("--check");
const paths = args.filter((arg) => !arg.startsWith("--"));

const requested = hook ? await hookTarget() : resolve(paths[0] ?? process.cwd());
const cwd = existsSync(requested) ? requested : process.cwd();
const problem = verdict(cwd);

if (problem === null) {
  console.log(`✅ Worktree usable — ${summary(cwd)}.`);
  process.exit(0);
}

console.error(`❌ ${problem}`);
process.exit(hook ? BLOCK : check ? 1 : 0);
