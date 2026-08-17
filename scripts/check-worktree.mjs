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
// Usage: node scripts/check-worktree.mjs [path...] [--check]
//        node scripts/check-worktree.mjs --hook     (PreToolUse, reads JSON on stdin)

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { relative, resolve } from "node:path";

/** Set when the primary tree is genuinely the right place — creating the first worktree. */
const ESCAPE = "NUBBIN_MAIN_TREE_OK";
/** PreToolUse blocks by exiting 2; stderr is what reaches the agent. */
const BLOCK = 2;

const git = (args, cwd) =>
  execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();

/**
 * A linked worktree has its own git dir under the common one; the primary tree has them equal.
 * Comparing resolved paths rather than parsing `git worktree list` keeps it correct when the
 * repository itself has moved, which has already happened here.
 */
function isPrimaryWorktree(cwd) {
  const dir = resolve(cwd, git(["rev-parse", "--git-dir"], cwd));
  const common = resolve(cwd, git(["rev-parse", "--git-common-dir"], cwd));
  return dir === common;
}

/** The repository root of whichever worktree `cwd` sits in. */
const worktreeRoot = (cwd) => git(["rev-parse", "--show-toplevel"], cwd);

/**
 * `pnpm exec lefthook` resolves from the worktree's own `node_modules`, so a worktree without
 * one cannot run the gate set even though the hooks fire.
 */
const gatesCanRun = (root) => existsSync(resolve(root, "node_modules", "lefthook"));

function verdict(cwd) {
  if (process.env[ESCAPE] === "1") return null;
  const root = worktreeRoot(cwd);
  if (isPrimaryWorktree(cwd)) {
    return [
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
  }
  if (!gatesCanRun(root)) {
    return [
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
  }
  return null;
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
    return path ? resolve(path, "..") : process.cwd();
  } catch {
    return process.cwd();
  }
}

const args = process.argv.slice(2);
const hook = args.includes("--hook");
const check = args.includes("--check");
const paths = args.filter((arg) => !arg.startsWith("--"));

const cwd = hook ? await hookTarget() : resolve(paths[0] ?? process.cwd());
const problem = verdict(existsSync(cwd) ? cwd : process.cwd());

if (problem === null) {
  const root = worktreeRoot(process.cwd());
  const where = isPrimaryWorktree(process.cwd()) ? "primary worktree" : "linked worktree";
  const label = relative(resolve(root, ".."), root) || root;
  console.log(`✅ Worktree usable — ${where} ${label}, lefthook installed.`);
  process.exit(0);
}

console.error(`❌ ${problem}`);
process.exit(hook ? BLOCK : check ? 1 : 0);
