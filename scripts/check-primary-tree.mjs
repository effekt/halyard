#!/usr/bin/env node

// Reports what is sitting uncommitted in the primary worktree, however it got there.
//
// `check-worktree.mjs` refuses the Write, Edit and MultiEdit tool calls, which is a mechanism.
// Anything reaching the filesystem another way never meets it: a `>` redirect inside a shell
// command, an MCP server writing beside whatever it drives, a build step, a test fixture.
// https://github.com/effekt/nubbin/issues/211 lists the three untracked files that `git status`
// found in the primary tree while that hook was active throughout. This check asks the outcome
// question instead, so the route stops mattering.
//
// It reports and never blocks, in both modes, because it cannot see *which* session wrote a
// file. A driver with legitimate uncommitted work trips it, and blocking on that would be a
// refusal roughly every time it fired — the only escape from which is switching the hook off,
// taking the working refusal with it.
//
// The two modes ask deliberately different questions. At dispatch, a modified tracked file
// matters as much as an untracked one: a subagent reading `.claude/rules/planning.md` cannot
// tell an uncommitted edit from committed state, and reasons from it either way. At pre-push,
// only untracked files are reported, because whoever is pushing can cheaply gitignore or remove
// a stray artifact, while a modified tracked file belongs to whoever is editing it and is theirs
// alone to resolve.
//
// Usage: node scripts/check-primary-tree.mjs [--check]
//        node scripts/check-primary-tree.mjs --hook   (PreToolUse on Agent|Task, JSON on stdin)

import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { primaryWorktreeRoot, statusEntries } from "./git-worktrees.mjs";

/** Porcelain's code for a path git is not tracking. */
const UNTRACKED = "??";

/**
 * Files an agent loads without being asked, where an uncommitted edit silently rewrites the
 * instructions it works from. Worth naming separately: every other dirty path is at worst noise.
 */
const AUTO_LOADED = /(?:^|\/)(?:AGENTS|CLAUDE)\.md$|^\.claude\//;

/** Enough of a list to act on. The total sits above it, so nothing is hidden by the truncation. */
const MAX_LISTED = 20;

const OWN_DIR = dirname(fileURLToPath(import.meta.url));

const untracked = (entries) => entries.filter((entry) => entry.code === UNTRACKED);

const autoLoaded = (entries) => entries.filter((entry) => AUTO_LOADED.test(entry.path));

const describe = (entry) =>
  `  ${entry.code} ${entry.path}${AUTO_LOADED.test(entry.path) ? "   ← auto-loaded by an agent" : ""}`;

function listing(entries) {
  const shown = entries.slice(0, MAX_LISTED).map(describe);
  const hidden = entries.length - shown.length;
  return hidden > 0 ? [...shown, `  … and ${hidden} more`] : shown;
}

/** Stated as fact and asking for nothing, so it reads as a repository status rather than an order. */
function report(root, entries) {
  const flagged = autoLoaded(entries).length;
  const instruction =
    flagged > 0
      ? `${flagged} of them an agent loads automatically, so the instructions in play here may differ from the committed ones.`
      : "None of them is a file an agent loads automatically.";
  return [
    `Repository state, from scripts/check-primary-tree.mjs rather than from the dispatching agent:`,
    `the primary worktree at ${root} holds ${entries.length} uncommitted path(s). Uncommitted`,
    `state there is not committed state. ${instruction}`,
    "",
    ...listing(entries),
  ].join("\n");
}

/** PreToolUse hands the tool call on stdin. */
async function readPayload() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const raw = chunks.join("");
  return raw.trim().length === 0 ? null : JSON.parse(raw);
}

/**
 * Appends the report to the dispatched agent's own prompt.
 *
 * `updatedInput` inside `hookSpecificOutput` applies with no `permissionDecision` set, which was
 * confirmed by dispatching against a hook that returned one — the field at the top level instead
 * is silently ignored. Returning `permissionDecision: "allow"` would also work and is not used:
 * it would pre-approve every dispatch, which is a wider grant than this report is worth.
 */
function injection(input, root, entries) {
  const toolInput = input?.tool_input;
  if (!toolInput?.prompt || entries.length === 0) return null;
  return {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      updatedInput: { ...toolInput, prompt: `${toolInput.prompt}\n\n${report(root, entries)}` },
    },
  };
}

/** A throw here would fail a dispatch that has nothing to do with this check, so nothing throws. */
async function hook() {
  try {
    const root = primaryWorktreeRoot(OWN_DIR);
    if (root === null) return;
    const payload = await readPayload();
    const emitted = injection(payload, root, statusEntries(root));
    if (emitted !== null) process.stdout.write(JSON.stringify(emitted));
  } catch {
    // A dispatch is worth more than a report about it.
  }
}

/** What was examined and how much of it, so a quiet run is distinguishable from an absent one. */
function check() {
  const root = primaryWorktreeRoot(OWN_DIR);
  if (root === null) {
    console.log("✅ Outside any repository — no primary worktree to examine.");
    return;
  }
  const entries = statusEntries(root);
  const leaked = untracked(entries);
  const scope = `${root} — ${entries.length} uncommitted path(s), ${leaked.length} untracked`;
  if (leaked.length === 0) {
    console.log(`✅ Primary worktree carries no untracked file — ${scope}.`);
    return;
  }
  console.log(`⚠️  Primary worktree carries untracked files — ${scope}.`);
  console.log(listing(leaked).join("\n"));
  console.log("\nGitignore them, commit them, or move them. This reports and does not block:");
  console.log("it cannot tell which session wrote them, and yours may not be the one that can.");
}

if (process.argv.includes("--hook")) await hook();
else check();
