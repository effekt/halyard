// Structural integrity for documentation: links resolve, anchors exist, fences balance, table
// headers are named, and every top-level document is in the index.
//
// Documentation rots differently from code. A stale sentence compiles, passes every lint, and
// reads as authoritative — the only signal is a reader acting on it. These are the failures a
// machine can see; terminology drift is the other half, and lives in `scripts/check-prose.mjs`.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { REPO_ROOT } from "./support/repoRoot.mjs";
import { trackedFiles } from "./support/trackedFiles.mjs";

const INDEX = join(REPO_ROOT, "docs/README.md");

/**
 * GitHub's heading-to-anchor rule. Each space becomes one hyphen and runs are *not* collapsed —
 * a removed em-dash leaves the spaces that surrounded it, so "Node — flat" anchors as
 * "node--flat". Collapsing here silently accepts broken links.
 */
function slugify(heading) {
  return heading
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/ /g, "-");
}

function anchorsIn(text) {
  const slugs = new Set();
  for (const line of text.split("\n")) {
    const match = /^#{1,6}\s+(.*)$/.exec(line);
    if (match) slugs.add(slugify(match[1]));
  }
  return slugs;
}

function unbalancedFences(text) {
  const fences = (text.match(/^```/gm) ?? []).length;
  return fences % 2 === 0 ? [] : [`unbalanced code fences (${fences})`];
}

// An empty header cell renders as a <th> with no text, so a screen reader announces the column
// by nothing at all. Markdown makes this easy to write and impossible to see.
function unnamedTableColumns(text) {
  const lines = text.split("\n");
  const problems = [];
  lines.forEach((line, index) => {
    if (!/^\|/.test(line)) return;
    if (!/^\|[\s:|-]+\|$/.test(lines[index + 1] ?? "")) return;
    const cells = line.split("|").slice(1, -1);
    if (cells.some((cell) => cell.trim() === "")) {
      problems.push(`line ${index + 1}: table header has an empty cell — name the column`);
    }
  });
  return problems;
}

/** The problem with one `](target#anchor)`, or "" where there is none. */
function brokenCrossLink(file, target, anchor, anchorsByFile) {
  if (!target.endsWith(".md")) return "";
  const resolved = resolve(dirname(file), target);
  if (!existsSync(resolved)) return `link to missing file: ${target}`;
  const anchors = anchorsByFile.get(resolved);
  if (anchor && anchors && !anchors.has(anchor)) {
    return `link to missing anchor: ${target}#${anchor}`;
  }
  return "";
}

function danglingLinks(file, text, anchorsByFile) {
  const problems = [];
  for (const match of text.matchAll(/\]\((?!https?:|mailto:|#)([^)\s]+)\)/g)) {
    const [target, anchor] = match[1].split("#");
    const problem = brokenCrossLink(file, target, anchor, anchorsByFile);
    if (problem !== "") problems.push(problem);
  }
  const own = anchorsIn(text);
  for (const match of text.matchAll(/\]\(#([^)\s]+)\)/g)) {
    if (!own.has(match[1])) problems.push(`link to missing local anchor: #${match[1]}`);
  }
  return problems;
}

const markdown = trackedFiles(REPO_ROOT)
  .filter((path) => path.endsWith(".md"))
  .map((path) => join(REPO_ROOT, path));
const bodies = new Map(markdown.map((file) => [file, readFileSync(file, "utf8")]));
const anchorsByFile = new Map([...bodies].map(([file, text]) => [file, anchorsIn(text)]));

describe("the detectors", () => {
  it("sees an odd number of fences", () => {
    expect(unbalancedFences("```\ncode\n")).toHaveLength(1);
    expect(unbalancedFences("```\ncode\n```\n")).toHaveLength(0);
  });

  it("sees an unnamed table column", () => {
    expect(unnamedTableColumns("| Gate |  |\n|---|---|\n| a | b |")).toHaveLength(1);
    expect(unnamedTableColumns("| Gate | Enforces |\n|---|---|\n| a | b |")).toHaveLength(0);
  });

  it("anchors a heading the way GitHub does, without collapsing space runs", () => {
    expect(slugify("Node — flat")).toBe("node--flat");
    expect(slugify("`compile` and the artifact")).toBe("compile-and-the-artifact");
  });

  it("sees a link to a file that is not there", () => {
    const problems = danglingLinks(INDEX, "see [x](./nothing-here.md)", anchorsByFile);
    expect(problems).toEqual(["link to missing file: ./nothing-here.md"]);
  });

  it("sees a link to an anchor a real document does not carry", () => {
    const problems = danglingLinks(INDEX, "see [x](./gates.md#no-such-heading)", anchorsByFile);
    expect(problems).toEqual(["link to missing anchor: ./gates.md#no-such-heading"]);
  });
});

describe("every tracked document", () => {
  it("balances its fences, names its table columns, and resolves its links", () => {
    expect(markdown.length).toBeGreaterThan(20);
    const problems = [];
    for (const [file, text] of bodies) {
      const rel = relative(REPO_ROOT, file);
      for (const problem of [
        ...unbalancedFences(text),
        ...unnamedTableColumns(text),
        ...danglingLinks(file, text, anchorsByFile),
      ]) {
        problems.push(`${rel}  ${problem}`);
      }
    }
    expect(problems).toEqual([]);
  });
});

describe("the docs index", () => {
  it("names every top-level document beside it", () => {
    const indexText = bodies.get(INDEX) ?? "";
    const onDisk = readdirSync(join(REPO_ROOT, "docs"))
      .filter((name) => name.endsWith(".md") && name !== "README.md")
      .sort();
    expect(onDisk.length).toBeGreaterThan(0);
    expect(onDisk.filter((name) => !indexText.includes(`(${name})`))).toEqual([]);
  });
});
