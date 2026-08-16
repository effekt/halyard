#!/usr/bin/env node
// PostToolUse bridge: run the mechanical gates against the single file an agent just
// wrote, so a violation surfaces at the edit rather than at commit time.
//
// Reads the hook payload on stdin, extracts `tool_input.file_path`, and delegates.
// Exit 2 blocks and returns stderr to the agent.

import { spawnSync } from "node:child_process";

const CODE_GATES = [
  ["node", ["scripts/check-single-export.mjs", "--check"]],
  ["node", ["scripts/check-structure.mjs", "--check"]],
  ["node", ["scripts/check-schema-depth.mjs", "--check"]],
  ["pnpm", ["exec", "biome", "check", "--no-errors-on-unmatched"]],
];

/** Prose carries vendor references as readily as code, so docs are checked too. */
const UNIVERSAL_GATES = [["node", ["scripts/check-no-vendor-refs.mjs", "--check"]]];

/** Judged against the file alone, so it runs per-file and reports the exact line. */
const PER_FILE_PROSE_GATES = [["node", ["scripts/check-prose.mjs", "--check"]]];

/**
 * A link is only broken relative to every other document, so this one takes no file argument
 * and runs against the whole corpus.
 */
const PROSE_GATES = [["node", ["scripts/check-docs.mjs", "--check"]]];

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
const isProse = /\.(md|mdx)$/.test(filePath);
const isManifest = filePath.endsWith("package.json");

/**
 * Every extension the vendor scanner reads. Deliberately wider than code and prose: the one
 * leak that survived four hand sweeps was a comment in a `.grit` file, which nothing scanned
 * because it was neither.
 */
const isScannable = /\.(md|mdx|ts|tsx|js|mjs|cjs|json|jsonc|ya?ml|toml|grit|txt|sh)$/.test(filePath);

const perFile = [
  ...(isCode ? CODE_GATES : []),
  ...(isManifest ? [["node", ["scripts/check-pinned-deps.mjs", "--check"]]] : []),
  ...(isProse ? PER_FILE_PROSE_GATES : []),
  ...(isScannable ? UNIVERSAL_GATES : []),
];

if (perFile.length === 0 && !isProse) process.exit(0);

const failures = [
  ...perFile.map(([command, args]) =>
    spawnSync(command, [...args, filePath], { encoding: "utf8" }),
  ),
  ...(isProse
    ? PROSE_GATES.map(([command, args]) => spawnSync(command, args, { encoding: "utf8" }))
    : []),
].filter((result) => result.status !== 0);

if (failures.length === 0) process.exit(0);

for (const failure of failures) {
  process.stderr.write(`${failure.stdout ?? ""}${failure.stderr ?? ""}`);
}
process.exit(2);
