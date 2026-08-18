// Enforces the contract `.claude/rules/writing-rules.md` states for rule files.
//
// Rule files are the one place in this repository where a written rule had no gate at all —
// including the rule about writing rules. The result was predictable: a file drifted two lines
// past its own stated cap and nothing noticed, because the only reader who would catch it is the
// one who already knows the cap exists.
//
// A rule file is read by an agent on every matching edit, so its cost is paid repeatedly. The caps
// here are about that cost, not about tidiness.

import { readFileSync } from "node:fs";
import { join, matchesGlob } from "node:path";
import { describe, expect, it } from "vitest";
import { REPO_ROOT } from "./support/repoRoot.mjs";
import { trackedFiles } from "./support/trackedFiles.mjs";

const MAX_LINES = 150;
const REQUIRED_KEYS = ["paths", "title", "summary", "status"];

/** Frontmatter as raw key/value pairs; a rule file's frontmatter is always flat. */
function frontmatter(text) {
  const lines = text.split("\n");
  if (lines[0]?.trim() !== "---") return null;
  const end = lines.indexOf("---", 1);
  if (end === -1) return null;
  const keys = new Map();
  for (const line of lines.slice(1, end)) {
    const match = /^([a-z]+):\s*(.*)$/.exec(line);
    if (match) keys.set(match[1], match[2].trim());
  }
  return keys;
}

function globsOf(keys) {
  return (keys.get("paths") ?? "")
    .replace(/^"|"$/g, "")
    .split(",")
    .map((glob) => glob.trim())
    .filter(Boolean);
}

/**
 * A glob that matches nothing loads the rule for no edit, and reads exactly like one that governs
 * the whole tree. `block-authoring.md` globbed `packages/**` and `apps/**` while every block in the
 * repository was authored under `examples/`, so the rule mandating per-block tests reached none of
 * the fourteen. Anticipating a directory is legitimate, so a single dead glob is tolerated; a rule
 * whose every glob is dead governs nothing.
 */
function overLineCap(rel, text) {
  const lines = text.split("\n");
  const count = lines.length - (lines.at(-1) === "" ? 1 : 0);
  if (count <= MAX_LINES) return [];
  return [`${rel}  ${count} lines, cap is ${MAX_LINES} — split it, or cut what a gate covers`];
}

function frontmatterProblems(rel, keys, tracked) {
  const problems = REQUIRED_KEYS.filter((key) => !keys.has(key) || keys.get(key) === "").map(
    (key) => `${rel}  frontmatter missing: ${key}`,
  );
  const globs = globsOf(keys);
  const dead = globs.filter((glob) => !tracked.some((file) => matchesGlob(file, glob)));
  if (globs.length > 0 && dead.length === globs.length) {
    problems.push(`${rel}  every paths glob matches no tracked file: ${dead.join(", ")}`);
  }
  return problems;
}

function bodyProblems(rel, text) {
  const problems = [];
  if (!/^##\s+Checklist\s*$/m.test(text)) {
    problems.push(`${rel}  no "## Checklist" section — a rule ends with what to verify`);
  }
  // A rule that never says whether it is enforced reads as enforced. Saying `none` is a valid
  // answer and the common one — the requirement is to say it.
  if (!/\*\*Gate:\*\*/.test(text)) {
    problems.push(`${rel}  no "**Gate:**" declaration — say what enforces this, or say none`);
  }
  return problems;
}

function problemsIn(rel, text, tracked) {
  const capped = overLineCap(rel, text);
  const keys = frontmatter(text);
  if (keys === null) return [...capped, `${rel}  no frontmatter`];
  return [...capped, ...frontmatterProblems(rel, keys, tracked), ...bodyProblems(rel, text)];
}

const WELL_FORMED = `---
paths: "docs/**"
title: t
summary: s
status: stable
---

Body. **Gate:** none

## Checklist

- [ ] done
`;

describe("the detector", () => {
  const tracked = ["docs/gates.md"];

  it("passes a well-formed rule", () => {
    expect(problemsIn("r.md", WELL_FORMED, tracked)).toEqual([]);
  });

  it("fails a rule over the line cap", () => {
    const long = WELL_FORMED.replace("Body.", `Body.\n${"x\n".repeat(MAX_LINES)}`);
    const [first] = problemsIn("r.md", long, tracked);
    expect(first).toMatch(/^r\.md {2}\d+ lines, cap is 150 —/);
    expect(problemsIn("r.md", WELL_FORMED, tracked)).toEqual([]);
  });

  it("fails a rule with no frontmatter, no checklist, and no gate declaration", () => {
    expect(problemsIn("r.md", "just prose\n", tracked)).toEqual(["r.md  no frontmatter"]);
    expect(problemsIn("r.md", WELL_FORMED.replace("## Checklist", "## Steps"), tracked)).toEqual([
      'r.md  no "## Checklist" section — a rule ends with what to verify',
    ]);
    expect(problemsIn("r.md", WELL_FORMED.replace("**Gate:** none", "no gate"), tracked)).toEqual([
      'r.md  no "**Gate:**" declaration — say what enforces this, or say none',
    ]);
  });

  it("fails a rule whose every paths glob matches nothing", () => {
    const dead = WELL_FORMED.replace('paths: "docs/**"', 'paths: "nowhere/**, alsonowhere/**"');
    expect(problemsIn("r.md", dead, tracked)).toEqual([
      "r.md  every paths glob matches no tracked file: nowhere/**, alsonowhere/**",
    ]);
  });
});

describe("every rule file", () => {
  it("is well-formed", () => {
    const tracked = trackedFiles(REPO_ROOT);
    const rules = tracked.filter(
      (path) => path.startsWith(".claude/rules/") && path.endsWith(".md"),
    );
    expect(rules.length).toBeGreaterThan(5);
    const problems = rules.flatMap((rel) =>
      problemsIn(rel, readFileSync(join(REPO_ROOT, rel), "utf8"), tracked),
    );
    expect(problems).toEqual([]);
  });
});
