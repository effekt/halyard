#!/usr/bin/env node
// PostToolUse bridge: run the mechanical gates against the single file an agent just
// wrote, so a violation surfaces at the edit rather than at commit time.
//
// Reads the hook payload on stdin, extracts `tool_input.file_path`, and delegates.
// Exit 2 blocks and returns stderr to the agent.

import { execFileSync, spawnSync } from "node:child_process";
import { dirname } from "node:path";
import { isBinaryPath } from "./isBinaryPath.mjs";

/**
 * The gates resolve their arguments against the working directory, and a hook inherits the
 * session's — which is the primary checkout even when the edit landed in a worktree. Running
 * them there reported every new file in a worktree as missing. Derive the root from the edited
 * file instead, so the gate reads the tree the edit is actually in.
 */
function rootOf(filePath) {
  try {
    return execFileSync("git", ["rev-parse", "--show-toplevel"], {
      cwd: dirname(filePath),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return process.cwd();
  }
}

const CODE_GATES = [
  ["node", ["scripts/check-single-export.mjs", "--check"]],
  ["node", ["scripts/check-structure.mjs", "--check"]],
  ["node", ["scripts/check-schema-depth.mjs", "--check"]],
  ["pnpm", ["exec", "biome", "check", "--no-errors-on-unmatched"]],
];

/** Markup and stylesheets, which is where an accessibility failure is written. */
const MARKUP_GATES = [["node", ["scripts/check-a11y.mjs", "--check"]]];

/** Prose carries vendor references as readily as code, so docs are checked too. */
const UNIVERSAL_GATES = [["node", ["scripts/check-no-vendor-refs.mjs", "--check"]]];

/** Judged against the file alone, so these run per-file and report the exact line. */
const PER_FILE_PROSE_GATES = [
  ["node", ["scripts/check-prose.mjs", "--check"]],
  // A filename either resolves against the filesystem or it does not — no other document is
  // involved, so this belongs at the edit rather than waiting for the commit.
  ["node", ["scripts/check-file-refs.mjs", "--check"]],
];

/**
 * A link is only broken relative to every other document, and a claim is only duplicated
 * relative to where else it appears, so these take no file argument and read the whole corpus.
 */
const PROSE_GATES = [
  ["node", ["scripts/check-docs.mjs", "--check"]],
  ["node", ["scripts/check-prose-dupes.mjs", "--check"]],
];

const payload = await new Promise((resolve) => {
  let raw = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => {
    raw += chunk;
  });
  process.stdin.on("end", () => resolve(raw));
});

let filePath;
try {
  filePath = JSON.parse(payload)?.tool_input?.file_path;
} catch {
  process.exit(0);
}

if (!filePath) process.exit(0);

const isCode = /\.tsx?$/.test(filePath);
const isMarkup = /\.(tsx|jsx|html|css)$/.test(filePath);
const isProse = /\.(md|mdx)$/.test(filePath);
const isManifest = filePath.endsWith("package.json");

/**
 * Everything but the certainly-binary, matching the vendor scanner's own sweep. An allowlist
 * of extensions here once hid a leak in a `.grit` comment that nothing scanned because the
 * list predated the file type — the same blindness would meet the next new extension.
 */
const isScannable = !isBinaryPath(filePath);

const perFile = [
  ...(isCode ? CODE_GATES : []),
  ...(isMarkup ? MARKUP_GATES : []),
  ...(isManifest ? [["node", ["scripts/check-pinned-deps.mjs", "--check"]]] : []),
  ...(isProse ? PER_FILE_PROSE_GATES : []),
  ...(isScannable ? UNIVERSAL_GATES : []),
];

if (perFile.length === 0 && !isProse) process.exit(0);

const cwd = rootOf(filePath);

const failures = [
  ...perFile.map(([command, args]) =>
    spawnSync(command, [...args, filePath], { encoding: "utf8", cwd }),
  ),
  ...(isProse
    ? PROSE_GATES.map(([command, args]) => spawnSync(command, args, { encoding: "utf8", cwd }))
    : []),
].filter((result) => result.status !== 0);

if (failures.length === 0) process.exit(0);

for (const failure of failures) {
  process.stderr.write(`${failure.stdout ?? ""}${failure.stderr ?? ""}`);
}
process.exit(2);
