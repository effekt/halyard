// Fails when the same claim is written into two prose files, or twice into one.
//
// A claim about a marker collision went into an issue comment, a pull request body and a rule file
// before anyone checked it. It was wrong. One copy would have been one correction; three were
// three, and the rule file would have outlived the other two. Duplicated prose reads as emphasis
// rather than as duplication, so a reviewer sees two correct-looking sentences instead of one
// claim in two places.

import { readFileSync, realpathSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { extractProse, findClones } from "./support/proseClones.mjs";
import { REPO_ROOT } from "./support/repoRoot.mjs";
import { trackedFiles } from "./support/trackedFiles.mjs";

/**
 * The surfaces a claim can live on. `.claude/rules` and `.claude/skills` were invisible to the
 * script this replaces, which scanned `docs` and `AGENTS.md` only — and a rule file is the copy
 * most likely to outlive the document it was copied from, because it is re-read on every matching
 * edit. `AGENTS.md` is resolved through its real path so the `CLAUDE.md` symlink beside it cannot
 * enter the corpus as a second file and read as a perfect clone of it.
 */
const SCAN = ["docs", "AGENTS.md", ".claude/rules", ".claude/skills"];

/**
 * The shortest run of identical words counted as a copy. Chosen by sweeping the extracted corpus
 * and reading every hit: at 10 words and below the hits include a section heading two rule files
 * share and stock sentences about how a gate runs — recurrence that is the repository's voice, not
 * a claim in two homes. At 12 every hit is one claim written into two documents.
 */
const MIN_RUN_WORDS = 12;

function corpus() {
  const seen = new Set();
  const documents = [];
  for (const path of trackedFiles(REPO_ROOT)) {
    if (!path.endsWith(".md")) continue;
    if (!SCAN.some((root) => path === root || path.startsWith(`${root}/`))) continue;
    const real = realpathSync(join(REPO_ROOT, path));
    if (seen.has(real)) continue;
    seen.add(real);
    documents.push({
      rel: relative(REPO_ROOT, real),
      prose: extractProse(readFileSync(real, "utf8")),
    });
  }
  return documents.sort((a, b) => a.rel.localeCompare(b.rel));
}

describe("the detector", () => {
  it("reports one claim written into two documents", () => {
    const claim =
      "a compiled artifact is immutable and content addressed so publishing writes a new one";
    const documents = [
      { rel: "a.md", prose: [claim] },
      { rel: "b.md", prose: ["preamble", claim] },
    ];
    const { clones } = findClones(documents, MIN_RUN_WORDS);
    expect(clones).toHaveLength(1);
    expect(clones[0].words).toBe(claim);
  });

  it("does not match a document against itself at the same position", () => {
    const documents = [
      { rel: "a.md", prose: ["one two three four five six seven eight nine ten eleven twelve"] },
    ];
    expect(findClones(documents, MIN_RUN_WORDS).clones).toEqual([]);
  });

  it("ignores fenced blocks, comments, tables and frontmatter", () => {
    const quoted = "```\nthe same twelve words repeated here inside a fence for both of them\n```";
    const table = "| the same twelve words repeated here inside a table for both of them |";
    const documents = [
      { rel: "a.md", prose: extractProse(`---\ntitle: a\n---\n${quoted}\n${table}\n`) },
      { rel: "b.md", prose: extractProse(`---\ntitle: b\n---\n${quoted}\n${table}\n`) },
    ];
    expect(findClones(documents, MIN_RUN_WORDS).clones).toEqual([]);
  });
});

describe("the prose corpus", () => {
  const documents = corpus();
  const { clones, words } = findClones(documents, MIN_RUN_WORDS);

  it("covers docs, AGENTS.md, the rules and the skills", () => {
    expect(documents.length).toBeGreaterThan(25);
    expect(words).toBeGreaterThan(15_000);
    for (const root of SCAN) {
      expect(documents.some(({ rel }) => rel === root || rel.startsWith(`${root}/`))).toBe(true);
    }
  });

  /**
   * A budget of zero, because a budget above zero grows quietly as an allowance and fails whoever
   * next adds prose rather than whoever copies a claim. Every claim has one home, so a second copy
   * is a defect rather than a backlog item.
   */
  it("holds no claim in two places", () => {
    const report = clones.map(
      ({ sides, length, words: text }) => `${sides}\n  ${length} words: ${text}`,
    );
    expect(report).toEqual([]);
  });
});
