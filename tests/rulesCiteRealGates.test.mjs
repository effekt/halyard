// A rule that names a gate reads as enforced, and naming one that does not exist is worse than
// saying nothing: the declaration is what stops a reader checking. `planning.md` cited
// `check-plan-files.mjs` while no such script existed, and a rule came to cite a `worktree` skill
// that had never been committed — `.gitignore` carries `/.claude/skills/*` with one negation per
// repository-local skill, so a skill added without its `!` line is staged by nothing.
//
// This is the one half of the deleted `check-gate-table.mjs` that ever caught a defect. The rest
// of it policed a hand-maintained gate list against a hand-maintained table, both of which are
// gone.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { REPO_ROOT } from "./support/repoRoot.mjs";
import { trackedFiles } from "./support/trackedFiles.mjs";

const SCRIPT = /`(check-[a-z0-9-]+\.mjs)`/g;
const SKILL = /`([a-z][a-z0-9-]+)` skill/g;

function phantomCitations(rel, text) {
  const phantoms = [];
  for (const [, named] of text.matchAll(SCRIPT)) {
    if (!existsSync(join(REPO_ROOT, "scripts", named))) {
      phantoms.push(`${rel}  names ${named}, which does not exist`);
    }
  }
  for (const [, named] of text.matchAll(SKILL)) {
    if (!existsSync(join(REPO_ROOT, ".claude/skills", named, "SKILL.md"))) {
      phantoms.push(`${rel}  names the \`${named}\` skill, which does not exist`);
    }
  }
  return phantoms;
}

describe("the detector", () => {
  it("sees a rule naming a script that is not there", () => {
    expect(phantomCitations("r.md", "**Gate:** `check-nothing-at-all.mjs`")).toEqual([
      "r.md  names check-nothing-at-all.mjs, which does not exist",
    ]);
  });

  it("sees a rule naming a skill that is not there", () => {
    expect(phantomCitations("r.md", "run the `nonexistent` skill first")).toEqual([
      "r.md  names the `nonexistent` skill, which does not exist",
    ]);
  });

  it("passes a rule naming a script and a skill that are there", () => {
    expect(phantomCitations("r.md", "`check-prose.mjs` and the `worktree` skill")).toEqual([]);
  });
});

describe("every rule file", () => {
  it("names only gates and skills that exist", () => {
    const rules = trackedFiles(REPO_ROOT).filter((path) => path.startsWith(".claude/rules/"));
    expect(rules.length).toBeGreaterThan(5);
    const phantoms = rules.flatMap((rel) =>
      phantomCitations(rel, readFileSync(join(REPO_ROOT, rel), "utf8")),
    );
    expect(phantoms).toEqual([]);
  });
});
