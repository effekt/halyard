// Fails when a gate `pnpm verify` runs is absent from `.github/workflows/`, and when a gate
// recorded here as CI-exempt turns out to run there after all.
//
// `check-gate-table.mjs` reconciles the table in `docs/gates.md` against `pnpm verify`. Nothing
// reconciled `verify` against the workflow, and five gates had drifted out of CI unnoticed —
// `check-file-refs.mjs`, `check-peer-deps.mjs`, `check-gate-table.mjs`, `check-script-invocations.mjs`
// and `sync-core-version.mjs`. A pull request from a machine whose pre-push hooks did not fire,
// or opened from the web, merged without any of them.
//
// Three things this gets wrong if written the obvious way, each learned by writing it wrong:
//
//   - The invoked-name set is not a parity key. The two sides spell the same gate differently,
//     so comparing names reports gaps that are spelling. The `scripts/*.mjs` filename is the
//     only key with one spelling on both sides.
//   - A step whose first line is `- run:` is invisible to /^\s*run:/, and a scanner missing
//     three steps in thirty-four looks entirely healthy. The step count is printed on every run
//     so that it is checkable rather than assumed.
//   - An exemption is only honest asserted in both directions. A gate recorded as CI-exempt
//     must fail this check the moment it appears in a workflow, or the list is decoration.
//
// Usage: node scripts/check-ci-parity.mjs [--check]

import { readdir, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { reachableFrom, reachableFromVerify } from "./verifyReachability.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const WORKFLOWS = join(ROOT, ".github", "workflows");

/**
 * Gates `verify` runs that CI deliberately does not. Each carries its reason, because an
 * exemption without one cannot be told from an oversight — which is how the five above drifted.
 */
const CI_EXEMPT = new Map([
  [
    "check-plugins-lock.mjs",
    "reads ~/.claude/plugins, absent on a runner; its no-manifest path exits 0 having compared nothing",
  ],
]);

/** Any `run:` key, including the one that opens a step as `- run:`, which is the miss. */
const RUN_KEY = /^(\s*)(?:-\s+)?run:\s?(.*)$/;
/** A whole-line YAML comment. A comment naming `pnpm verify` once made this compare verify to itself. */
const COMMENT = /^\s*#/;

async function workflowText() {
  const names = (await readdir(WORKFLOWS)).filter((name) => /\.ya?ml$/.test(name));
  const bodies = await Promise.all(names.map((name) => readFile(join(WORKFLOWS, name), "utf8")));
  return { names, text: bodies.join("\n") };
}

/**
 * The command each `run:` step carries: the text on the key's own line, plus every following
 * line indented past it, which is how a block scalar (`run: |`) holds a multi-line command.
 *
 * Comments are dropped first, and only these commands are walked — never the file as a whole.
 * `verify.yml` carries a comment mentioning `pnpm verify`, and feeding the raw text to the walker
 * made this gate follow it, pull in every gate `verify` runs, and report parity with itself.
 */
function runCommands(text) {
  const lines = text.split("\n").filter((line) => !COMMENT.test(line));
  const commands = [];
  for (let index = 0; index < lines.length; index += 1) {
    const key = lines[index].match(RUN_KEY);
    if (!key) continue;
    const indent = key[1].length;
    const body = [key[2]];
    while (index + 1 < lines.length) {
      const next = lines[index + 1];
      const deeper = next.trim() === "" || next.search(/\S/) > indent;
      if (!deeper) break;
      body.push(next);
      index += 1;
    }
    commands.push(body.join("\n"));
  }
  return commands;
}

/**
 * Every gate those commands reach, walked through `package.json` the same way `verify` is. A step
 * reads `pnpm publishable`, which reaches three scripts it never names; matching filenames in the
 * raw text would report all three as absent from CI while CI runs them.
 */
function scriptsInWorkflows(text, scripts) {
  return reachableFrom(runCommands(text), scripts).files;
}

function stepCount(text) {
  return runCommands(text).length;
}

function report(missing, wrongExempt, counts) {
  console.log(
    `\n❌ CI does not run everything \`verify\` does — ${counts.workflows} workflow file(s), ${counts.steps} run step(s), ${counts.verify} gate(s) in verify.\n`,
  );
  for (const gate of missing) {
    console.log(`  ${gate}  runs in verify, absent from every workflow`);
    console.log("        → add a step, or record it in CI_EXEMPT here with a reason");
  }
  for (const gate of wrongExempt) {
    console.log(`  ${gate}  recorded CI-exempt, but a workflow runs it`);
    console.log("        → drop it from CI_EXEMPT\n");
  }
}

const pkg = JSON.parse(await readFile(join(ROOT, "package.json"), "utf8"));
const { files } = reachableFromVerify(pkg.scripts ?? {});
const { names, text } = await workflowText();
const inCi = scriptsInWorkflows(text, pkg.scripts ?? {});

const missing = [...files].filter((gate) => !inCi.has(gate) && !CI_EXEMPT.has(gate)).sort();
const wrongExempt = [...CI_EXEMPT.keys()].filter((gate) => inCi.has(gate)).sort();
const counts = { workflows: names.length, steps: stepCount(text), verify: files.size };

if (missing.length === 0 && wrongExempt.length === 0) {
  console.log(
    `✅ CI runs what verify runs — ${counts.verify} gate(s) across ${counts.workflows} workflow file(s) and ${counts.steps} run step(s), ${CI_EXEMPT.size} documented exemption(s).`,
  );
  process.exit(0);
}

report(missing, wrongExempt, counts);
process.exit(process.argv.includes("--check") ? 1 : 0);
