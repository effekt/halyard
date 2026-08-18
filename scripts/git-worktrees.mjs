#!/usr/bin/env node

// Locating and interrogating the worktrees of this repository.
//
// Shared by the two checks that care where a file landed: `check-worktree.mjs`, which refuses an
// edit aimed at the primary tree, and `check-primary-tree.mjs`, which reports what is sitting in
// that tree however it arrived. They agreed on this logic by having two copies of it.

import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

/**
 * `null` where `cwd` is not inside a repository, which every caller treats as "not mine".
 *
 * Only the trailing newline comes off. A full `trim()` also ate the leading space that
 * `status --porcelain` puts in front of an unstaged change, so the first entry came back one
 * character short — `.claude/rules/planning.md` read as `claude/rules/planning.md`, which then
 * failed the pattern that flags an auto-loaded file. A seeded modified file is what surfaced it.
 */
export function gitIn(cwd, args) {
  try {
    return execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).replace(/\n+$/, "");
  } catch {
    return null;
  }
}

/** Absolute common directory for `cwd`, shared by a repository's primary tree and its worktrees. */
export function commonDirOf(cwd) {
  const common = gitIn(cwd, ["rev-parse", "--git-common-dir"]);
  return common === null ? null : resolve(cwd, common);
}

/**
 * A linked worktree has its own git dir under the common one; the primary tree has them equal.
 * Comparing resolved paths rather than parsing `git worktree list` keeps it correct when the
 * repository itself has moved, which has already happened here.
 */
export function isPrimaryWorktree(cwd) {
  const dir = gitIn(cwd, ["rev-parse", "--git-dir"]);
  return dir !== null && resolve(cwd, dir) === commonDirOf(cwd);
}

/**
 * The primary worktree's root, reachable from any linked worktree of the same repository.
 *
 * `git worktree list` documents the main worktree as the first entry, which is the only ordering
 * guarantee available; deriving it from the common directory instead assumes that directory is
 * named `.git` and sits inside the tree, and neither holds for a repository cloned bare.
 */
export function primaryWorktreeRoot(cwd) {
  const listed = gitIn(cwd, ["worktree", "list", "--porcelain"]);
  const first = listed?.split("\n").find((line) => line.startsWith("worktree "));
  return first === undefined ? null : first.slice("worktree ".length);
}

/**
 * One entry per changed path in `root`, as `{ code, path }`.
 *
 * `--porcelain` already omits everything `.gitignore` covers, so ignoring a path is how a file is
 * excluded from every caller here — there is no second exclusion list to keep in step. Untracked
 * directories stay collapsed to a single entry, so a tool that writes forty log files is reported
 * as the one directory a reader can act on. `core.quotePath=false` keeps a non-ASCII path
 * readable instead of escaped.
 */
export function statusEntries(root) {
  const status = gitIn(root, ["-c", "core.quotePath=false", "status", "--porcelain"]);
  if (status === null || status.length === 0) return [];
  return status.split("\n").map((line) => ({ code: line.slice(0, 2), path: line.slice(3) }));
}
