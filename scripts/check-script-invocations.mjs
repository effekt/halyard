#!/usr/bin/env node

// Fails when a script whose name collides with a package-manager command is invoked by bare
// shorthand.
//
// `pnpm <name>` is shorthand for `pnpm run <name>` only while `<name>` is not already a command
// the package manager resolves itself. Where it is, that command runs instead — `docs` opens a
// package homepage and exits 0, printing nothing. The script never runs, the chain continues,
// and the caller reads a clean exit as a pass.
//
// This is not hypothetical. `pnpm verify` carried `pnpm docs` and therefore never once ran
// `check-docs.mjs`; every local "verify passes" was made with the documentation gate skipped.
// CI was unaffected because it invokes `node scripts/check-docs.mjs` directly, so the cost was
// false confidence on a developer's machine rather than broken links shipping — which is
// exactly the failure this repository keeps finding: a gate that reports success while
// checking nothing.
//
// Renaming the script would work too, and would be silent the next time someone picks a name
// pnpm later claims. `pnpm run <name>` is unambiguous forever, so that is what this requires.
//
// Usage: node scripts/check-script-invocations.mjs [--check]

import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const WORKFLOWS = join(ROOT, ".github", "workflows");

// Commands pnpm resolves itself, including the npm ones it proxies. A name here is never
// reached by shorthand, whatever the package declares.
const PNPM_COMMANDS = new Set([
  "add",
  "audit",
  "bin",
  "config",
  "create",
  "dedupe",
  "deploy",
  "dlx",
  "doc",
  "docs",
  "env",
  "exec",
  "fetch",
  "i",
  "import",
  "init",
  "install",
  "install-test",
  "it",
  "licenses",
  "link",
  "list",
  "ln",
  "ls",
  "outdated",
  "pack",
  "patch",
  "patch-commit",
  "patch-remove",
  "prune",
  "publish",
  "rebuild",
  "remove",
  "rm",
  "root",
  "run",
  "server",
  "setup",
  "start",
  "store",
  "test",
  "un",
  "uninstall",
  "unlink",
  "update",
  "up",
  "why",
]);

// `test` and `start` are the deliberate exceptions: pnpm's subcommand *is* "run the script of
// that name", so the shorthand does the right thing and every ecosystem tool expects it.
const SHORTHAND_IS_CORRECT = new Set(["test", "start"]);

async function workflowSources() {
  if (!existsSync(WORKFLOWS)) return [];
  const names = (await readdir(WORKFLOWS)).filter((n) => /\.ya?ml$/.test(n));
  return Promise.all(
    names.map(async (n) => ({
      file: `.github/workflows/${n}`,
      text: await readFile(join(WORKFLOWS, n), "utf8"),
    })),
  );
}

const manifest = JSON.parse(await readFile(join(ROOT, "package.json"), "utf8"));
const scripts = manifest.scripts ?? {};

const shadowed = Object.keys(scripts).filter(
  (name) => PNPM_COMMANDS.has(name) && !SHORTHAND_IS_CORRECT.has(name),
);

const sources = [
  ...Object.entries(scripts).map(([name, body]) => ({
    file: `package.json → scripts.${name}`,
    text: body,
  })),
  ...(await workflowSources()),
];

const problems = [];
for (const name of shadowed) {
  // `pnpm docs` but not `pnpm run docs`, and not `pnpm --filter x docs`, which is also explicit.
  const bare = new RegExp(String.raw`pnpm\s+${name}\b(?!\s*-)`, "g");
  for (const { file, text } of sources) {
    for (const match of text.matchAll(bare)) {
      const before = text.slice(Math.max(0, match.index - 12), match.index);
      if (/run\s+$/.test(before)) continue;
      problems.push(
        `${file}\n        "${match[0]}" — the package manager claims \`${name}\`, so the script never runs`,
      );
    }
  }
}

if (shadowed.length === 0) {
  console.log("✅ No script name collides with a package-manager command.");
  process.exit(0);
}

if (problems.length === 0) {
  console.log(
    `✅ Script invocations explicit — ${shadowed.length} shadowed name(s) (${shadowed.join(", ")}), all invoked with \`pnpm run\`.`,
  );
  process.exit(0);
}

console.log(`\n❌ ${problems.length} script(s) invoked by a shorthand pnpm will not honour.\n`);
for (const problem of problems) console.log(`  ${problem}`);
console.log(`\n        → use \`pnpm run <name>\`, which is unambiguous whatever pnpm adds later\n`);
process.exit(process.argv.includes("--check") ? 1 : 0);
