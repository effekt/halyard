#!/usr/bin/env node
// PostToolUse bridge: run the mechanical gates against the single file an agent just
// wrote, so a violation surfaces at the edit rather than at commit time.
//
// Reads the hook payload on stdin, extracts `tool_input.file_path`, and delegates.
// Exit 2 blocks and returns stderr to the agent.

import { execFileSync, spawnSync } from "node:child_process";
import { dirname } from "node:path";

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

/** Takes the edited path, so it reports the exact line rather than a whole-corpus summary. */
const CODE_GATES = [["pnpm", ["exec", "biome", "check", "--no-errors-on-unmatched"]]];

/** Markup and stylesheets, which is where an accessibility failure is written. */
const MARKUP_GATES = [["node", ["scripts/check-a11y.mjs", "--check"]]];

/** Judged against the file alone, so this runs per-file and reports the exact line. */
const PER_FILE_PROSE_GATES = [["node", ["scripts/check-prose.mjs", "--check"]]];

/**
 * Everything else is a repository invariant, and lives in `tests/` where the runner owns the
 * verdict. The whole `repo` project runs rather than a selection: these read files as *data*
 * rather than importing them, so `vitest related` selects none of them for any edited path. It
 * costs about 400ms, which is affordable once per edit and is why they are all in one project.
 */
const SUITE = ["pnpm", ["exec", "vitest", "run", "--project", "repo"]];

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

const perFile = [
  ...(isCode ? CODE_GATES : []),
  ...(isMarkup ? MARKUP_GATES : []),
  ...(isProse ? PER_FILE_PROSE_GATES : []),
];

// Corpus-wide, so no path argument: a manifest's specifier is exact only relative to the catalog
// it resolves through, and every invariant in the suite is a property of the tree, not of a file.
const corpus = [
  ...(isCode || isProse || isManifest ? [SUITE] : []),
  ...(isManifest ? [["pnpm", ["pinned-deps"]]] : []),
];

if (perFile.length === 0 && corpus.length === 0) process.exit(0);

const cwd = rootOf(filePath);

const failures = [
  ...perFile.map(([command, args]) =>
    spawnSync(command, [...args, filePath], { encoding: "utf8", cwd }),
  ),
  ...corpus.map(([command, args]) => spawnSync(command, args, { encoding: "utf8", cwd })),
].filter((result) => result.status !== 0);

if (failures.length === 0) process.exit(0);

for (const failure of failures) {
  process.stderr.write(`${failure.stdout ?? ""}${failure.stderr ?? ""}`);
}
process.exit(2);
